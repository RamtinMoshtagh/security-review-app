import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { ReviewStackParamList } from '../../navigation/types';
import { useReviewStore } from '../../store/useReviewStore';
import { classifyBehavior } from '../../utils/classifyAgent';
import { saveReview } from '../../utils/saveReview';

// Step components ─────────────────────────────────────────────
import VenueStep from './steps/VenueStep';
import RatingStep from './steps/RatingStep';
import TagsStep from './steps/TagsStep';
import StoryStep from './steps/StoryStep';
import SummaryStep from './steps/SummaryStep';

export type Step = 'venue' | 'rating' | 'tags' | 'story' | 'summary';

/**
 * Orchestrates the review wizard – this component only controls flow/state.
 */
const ReviewFlowScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<ReviewStackParamList, 'ReviewFlow'>>();

  const [step, setStep] = useState<Step>('venue');
  const [storyText, setStoryText] = useState('');

  const { rating, tags, setStory, reset: resetStore } = useReviewStore();

  // Memoised AI classification
  const ai = useMemo(() => classifyBehavior(rating, tags, storyText), [rating, tags, storyText]);

  // ────────────────────────────────────────────────────────── Handlers
  const handleContinue = () => {
    Haptics.selectionAsync();

    if (step === 'rating') return setStep('tags');
    if (step === 'tags') return setStep('story');
    if (step === 'story') {
      setStory(storyText);
      setStep('summary');
    }
  };

  const handleFinish = async () => {
    await saveReview();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    resetStore();
    setStoryText('');
    setStep('venue');

    navigation.navigate('Confirmation');
  };

  // Enable/disable Continue button
  const canContinue =
    (step === 'rating' && rating !== null) ||
    (step === 'tags' && tags.length > 0) ||
    (step === 'story' && storyText.trim().length >= 5);

  // ────────────────────────────────────────────────────────── Render helper
  const renderStep = () => {
    switch (step) {
      case 'venue':
        return <VenueStep onNext={() => setStep('rating')} />;
      case 'rating':
        return <RatingStep />;
      case 'tags':
        return <TagsStep />;
      case 'story':
        return <StoryStep story={storyText} onChangeStory={setStoryText} />;
      case 'summary':
        return <SummaryStep ai={ai} story={storyText} />;
      default:
        return null;
    }
  };

  // ────────────────────────────────────────────────────────── JSX
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            {renderStep()}

            {step === 'summary' ? (
              <Button
                mode="contained"
                onPress={handleFinish}
                style={{
                  marginBottom: 24,
                  alignSelf: 'center',
                  width: '70%',
                  borderRadius: 24,
                  backgroundColor: theme.colors.primary,
                }}
                labelStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 16 }}
                contentStyle={{ paddingVertical: 10 }}
              >
                Done
              </Button>
            ) : step !== 'venue' ? (
              <Button
                mode="contained"
                onPress={handleContinue}
                disabled={!canContinue}
                style={{
                  alignSelf: 'center',
                  width: '70%',
                  borderRadius: 24,
                  backgroundColor: theme.colors.primary,
                  opacity: canContinue ? 1 : 0.5,
                }}
                labelStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 16 }}
                contentStyle={{ paddingVertical: 10 }}
              >
                Continue →
              </Button>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ReviewFlowScreen;
