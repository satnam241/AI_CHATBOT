const otpStore = new Map<string, { otp: string; expires: number }>();

export const saveOtp = (phone: string, otp: string) => {
  otpStore.set(phone, {
    otp,
    expires: Date.now() + 5 * 60 * 1000
  });
};

export const getOtp = (phone: string) => {
  return otpStore.get(phone);
};

export const deleteOtp = (phone: string) => {
  otpStore.delete(phone);
}; 