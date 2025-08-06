import { CssBaseline } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router';

import { HomePage } from '../pages/HomePage/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';
import { UserPage } from '../pages/UserPage/UserPage';
import { NotificationsProvider } from '../providers/NotificationsProvider';

import { NotificationsStack } from './NotificationsStack';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: deepOrange[500],
    },
  },
});

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/:handle" element={<UserPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <NotificationsStack />
      </NotificationsProvider>
    </ThemeProvider>
  );
};
