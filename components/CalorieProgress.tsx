// components/CalorieProgress.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CalorieProgressProps {
  current: number;
  target: number;
}

export const CalorieProgress: React.FC<CalorieProgressProps> = ({ 
  current, 
  target 
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(0, target - current);
  const isOver = current > target;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Calories</Text>
      <Text style={styles.count}>
        {current} / {target}
      </Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${percentage}%`,
              backgroundColor: isOver ? '#FF5252' : '#fff'
            }
          ]} 
        />
      </View>
      <Text style={styles.remaining}>
        {isOver 
          ? `${current - target} kcal over limit`
          : `${remaining} kcal remaining`
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { 
    color: '#fff', 
    fontSize: 16, 
    marginBottom: 5,
    opacity: 0.9 
  },
  count: { 
    color: '#fff', 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden'
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 4 
  },
  remaining: { 
    color: '#fff', 
    fontSize: 14,
    fontWeight: '600'
  },
});