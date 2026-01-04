import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import SpotifyWebApi from 'spotify-web-api-node';

class AuthService {
  private spotifyApi: SpotifyWebApi;

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: config.spotifyClientId,
      clientSecret: config.spotifyClientSecret,
      redirectUri: config.spotifyRedirectUri
    });
  }

  async register(data: { email: string; password: string; displayName?: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        displayName: data.displayName,
        preferences: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true
      }
    });

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new AppError('User not found', 401);
      }

      const accessToken = this.generateAccessToken(user.id, user.email);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate password reset token
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password-reset' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset token
    // For now, log it
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; purpose: string };
      
      if (decoded.purpose !== 'password-reset') {
        throw new AppError('Invalid token', 400);
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash }
      });
    } catch (error) {
      throw new AppError('Invalid or expired token', 400);
    }
  }

  getSpotifyAuthUrl() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-library-read',
      'user-top-read',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ];

    return this.spotifyApi.createAuthorizeURL(scopes, 'state');
  }

  async handleSpotifyCallback(code: string) {
    const data = await this.spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;
    const expiresIn = data.body.expires_in;

    this.spotifyApi.setAccessToken(accessToken);
    
    const me = await this.spotifyApi.getMe();
    const spotifyEmail = me.body.email;

    if (!spotifyEmail) {
      throw new AppError('Email not available from Spotify', 400);
    }

    let user = await prisma.user.findUnique({
      where: { email: spotifyEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: spotifyEmail,
          displayName: me.body.display_name || spotifyEmail,
          oauthProvider: 'spotify',
          oauthId: me.body.id,
          spotifyToken: accessToken,
          spotifyRefreshToken: refreshToken,
          spotifyTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
          preferences: {
            create: {}
          }
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          spotifyToken: accessToken,
          spotifyRefreshToken: refreshToken,
          spotifyTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
          lastLoginAt: new Date()
        }
      });
    }

    const jwtAccessToken = this.generateAccessToken(user.id, user.email);
    const jwtRefreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      },
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken
    };
  }

  private generateAccessToken(userId: string, email: string) {
    return jwt.sign(
      { userId, email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  private generateRefreshToken(userId: string) {
    return jwt.sign(
      { userId },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );
  }
}

export const authService = new AuthService();
