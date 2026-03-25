export const otpStore = new Map<
  string,
  { otp: string; expires: number }
>();

export const saveOtp = (key: string, otp: string) => {
  otpStore.set(key, {
    otp,
    expires: Date.now() + 5 * 60 * 1000
  });
};

export const getOtp = (key: string) => {
  return otpStore.get(key);
};

export const deleteOtp = (key: string) => {
  otpStore.delete(key);
};