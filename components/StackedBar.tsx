import React from 'react';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

type Props = {
  good: number;
  okay: number;
  bad: number;
  width?: number; // px
};

const COLORS = ['#14c97d', '#f0c02e', '#d34f4f'];

const StackedBar: React.FC<Props> = ({ good, okay, bad, width = 140 }) => {
  const total = Math.max(good + okay + bad, 1);

  /** animate once on mount */
  const goodW = useSharedValue(0);
  const okayW = useSharedValue(0);
  const badW  = useSharedValue(0);

  React.useEffect(() => {
    const toPx = (val: number) => (val / total) * width;
    const cfg  = { duration: 450, easing: Easing.out(Easing.exp) };

    goodW.value = withTiming(toPx(good), cfg);
    okayW.value = withTiming(toPx(okay), cfg);
    badW.value  = withTiming(toPx(bad),  cfg);
  }, [good, okay, bad]);

  const s1 = useAnimatedStyle(() => ({ width: goodW.value }));
  const s2 = useAnimatedStyle(() => ({ width: okayW.value }));
  const s3 = useAnimatedStyle(() => ({ width: badW.value  }));

  return (
    <View style={[styles.container, { width }]}>
      <Animated.View style={[styles.segment, s1, { backgroundColor: COLORS[0] }]} />
      <Animated.View style={[styles.segment, s2, { backgroundColor: COLORS[1] }]} />
      <Animated.View style={[styles.segment, s3, { backgroundColor: COLORS[2] }]} />
    </View>
  );
};

export default StackedBar;

const styles = StyleSheet.create({
  container: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  segment: {
    height: 8,
  },
});
