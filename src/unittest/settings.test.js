import settingsReducer, {
  stopPromo,
  promoStatus,
  promoCenter,
  stopCookie,
  cookie
} from '../app/slices/settings';

describe('settings slice', () => {
  const initialState = {
    cookie: false,
    stopCookie: false,
    promoCenter: false,
    promoStatus: false,
    stopPromo: false
  };

  describe('stopPromo', () => {
    test('should set stopPromo to true', () => {
      const action = stopPromo();
      const newState = settingsReducer(initialState, action);
      expect(newState.stopPromo).toBe(true);
    });
  });

  describe('promoStatus', () => {
    test('should set promoStatus to true', () => {
      const action = promoStatus();
      const newState = settingsReducer(initialState, action);
      expect(newState.promoStatus).toBe(true);
    });
  });

  describe('promoCenter', () => {
    test('should toggle promoCenter from false to true', () => {
      const action = promoCenter();
      const newState = settingsReducer(initialState, action);
      expect(newState.promoCenter).toBe(true);
    });

    test('should toggle promoCenter from true to false', () => {
      const state = { ...initialState, promoCenter: true };
      const action = promoCenter();
      const newState = settingsReducer(state, action);
      expect(newState.promoCenter).toBe(false);
    });
  });

  describe('stopCookie', () => {
    test('should set stopCookie to true', () => {
      const action = stopCookie();
      const newState = settingsReducer(initialState, action);
      expect(newState.stopCookie).toBe(true);
    });
  });

  describe('cookie', () => {
    test('should toggle cookie from false to true', () => {
      const action = cookie();
      const newState = settingsReducer(initialState, action);
      expect(newState.cookie).toBe(true);
    });

    test('should toggle cookie from true to false', () => {
      const state = { ...initialState, cookie: true };
      const action = cookie();
      const newState = settingsReducer(state, action);
      expect(newState.cookie).toBe(false);
    });
  });
});

