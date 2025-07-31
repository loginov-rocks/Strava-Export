import { UserDocument } from '../models/userModel';

interface UserDto {
  stravaAthleteId: string;
  isPublic: boolean;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  avatarUrl: string | null;
}

export class UserDtoFactory {
  public createJson(user: UserDocument): UserDto {
    return {
      stravaAthleteId: user.stravaAthleteId,
      isPublic: user.isPublic,
      firstName: user.stravaProfile?.firstName || null,
      lastName: user.stravaProfile?.lastName || null,
      bio: user.stravaProfile?.bio || null,
      city: user.stravaProfile?.city || null,
      state: user.stravaProfile?.state || null,
      country: user.stravaProfile?.country || null,
      avatarUrl: user.stravaProfile?.avatarUrl || null,
    };
  }
}
