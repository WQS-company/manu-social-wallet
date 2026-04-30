module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Add Reanimated plugin — must be the last one in the list
    'react-native-reanimated/plugin',
  ],
};
