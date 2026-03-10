import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { LIGHT_COLORS, DARK_COLORS } from '../utils/constants';

export const useTheme = () => {
  const theme = useSelector((state: RootState) => state.user.theme);
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const isDark = theme === 'dark';

  return { theme, colors, isDark };
};
