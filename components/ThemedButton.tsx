import React from 'react';
import { Button, ButtonProps, useTheme } from 'react-native-paper';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * Thin wrapper around `react-native-paper`'s <Button> that automatically
 * applies primary colours, rounded corners, and padding so we don't repeat
 * the same `style` / `labelStyle` props everywhere.
 *
 * You can still override any prop. e.g.
 * ```tsx
 * <ThemedButton mode="outlined" onPress={...}>Cancel</ThemedButton>
 * ```
 */
const ThemedButton: React.FC<ButtonProps & { containerStyle?: StyleProp<ViewStyle> }> = ({
  children,
  style,
  containerStyle,
  labelStyle,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <Button
      {...rest}
      mode={rest.mode ?? 'contained'}
      style={[{
        borderRadius: 24,
        backgroundColor: rest.mode === 'contained' ? theme.colors.primary : undefined,
        alignSelf: 'center',
      }, style, containerStyle]}
      labelStyle={{
        color: rest.mode === 'contained' ? theme.colors.onPrimary : theme.colors.primary,
        fontWeight: '600',
        fontSize: 16,
        ...(labelStyle as object),
      }}
      contentStyle={{ paddingVertical: 10 }}
    >
      {children}
    </Button>
  );
};

export default ThemedButton;