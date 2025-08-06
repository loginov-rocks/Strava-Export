import { LockOutlined, PublicOutlined } from '@mui/icons-material';
import { Avatar, Card, CardActions, CardContent, CardHeader, IconButton } from '@mui/material';
import type { ReactNode } from 'react';

import type { User } from '../api/ApiClient';

interface Props {
  action?: ReactNode;
  user: User;
}

export const UserCard = ({ action, user }: Props) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const location = [user.city, user.state, user.country].filter(Boolean).join(', ');

  return (
    <Card>
      <CardHeader
        action={<IconButton disabled>{user.isPublic ? <PublicOutlined /> : <LockOutlined />}</IconButton>}
        avatar={user.avatarUrl && <Avatar src={user.avatarUrl} sx={{ width: 96, height: 96 }} />}
        subheader={location}
        title={fullName}
      />
      {user.bio && <CardContent>{user.bio}</CardContent>}
      {action && <CardActions>{action}</CardActions>}
    </Card>
  );
};
