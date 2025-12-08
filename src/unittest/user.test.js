import userReducer, { login, register, logout } from '../app/slices/user';

// localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

describe('user slice', () => {
  beforeEach(() => {
    localStorageMock.clear();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  describe('login', () => {
    test('should set user status to true and set default user', () => {
      const initialState = { status: false, user: {} };
      const action = login();
      const newState = userReducer(initialState, action);
      
      expect(newState.status).toBe(true);
      expect(newState.user.name).toBe('Jhon Doe');
      expect(newState.user.role).toBe('customer');
      expect(newState.user.email).toBe('jhondoe@gmail.com');
    });

    test('should save auth state to localStorage', () => {
      const initialState = { status: false, user: {} };
      const action = login();
      userReducer(initialState, action);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.status).toBe(true);
      expect(savedData.user.name).toBe('Jhon Doe');
    });
  });

  describe('register', () => {
    test('should register new user with provided data', () => {
      const initialState = { status: false, user: {} };
      const action = register({
        user: 'John Doe',
        email: 'john@example.com',
        pass: 'password123'
      });
      const newState = userReducer(initialState, action);
      
      expect(newState.status).toBe(true);
      expect(newState.user.name).toBe('John Doe');
      expect(newState.user.email).toBe('john@example.com');
      expect(newState.user.pass).toBe('password123');
      expect(newState.user.role).toBe('customer');
    });

    test('should save registered user to localStorage', () => {
      const initialState = { status: false, user: {} };
      const action = register({
        user: 'Jane Doe',
        email: 'jane@example.com',
        pass: 'password456'
      });
      userReducer(initialState, action);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.user.name).toBe('Jane Doe');
      expect(savedData.user.email).toBe('jane@example.com');
    });
  });

  describe('logout', () => {
    test('should set user status to false and clear user', () => {
      const initialState = {
        status: true,
        user: { name: 'John Doe', email: 'john@example.com' }
      };
      const action = logout();
      const newState = userReducer(initialState, action);
      
      expect(newState.status).toBe(false);
      expect(newState.user).toEqual({});
    });

    test('should remove auth state from localStorage', () => {
      const initialState = {
        status: true,
        user: { name: 'John Doe' }
      };
      const action = logout();
      userReducer(initialState, action);
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cs308_auth_state');
    });
  });
});

