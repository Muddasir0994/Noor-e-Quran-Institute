import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const TestComponent = () => {
  const { verifyPhoneOtp, sendPhoneOtp } = useAuth();

  return (
    <div>
      <button
        data-testid="verify-success"
        onClick={async () => {
          try {
            const data = await verifyPhoneOtp('1234567890', '123456');
            document.getElementById('result')!.textContent = JSON.stringify(data);
          } catch (e: any) {
            document.getElementById('error')!.textContent = e.message;
          }
        }}
      >
        Verify Success
      </button>
      <button
        data-testid="verify-error-specific"
        onClick={async () => {
          try {
            await verifyPhoneOtp('1234567890', 'invalid');
          } catch (e: any) {
            document.getElementById('error')!.textContent = e.message;
          }
        }}
      >
        Verify Error Specific
      </button>
      <button
        data-testid="verify-error-default"
        onClick={async () => {
          try {
            await verifyPhoneOtp('1234567890', 'invalid');
          } catch (e: any) {
            document.getElementById('error')!.textContent = e.message;
          }
        }}
      >
        Verify Error Default
      </button>
      <button
        data-testid="verify-error-network"
        onClick={async () => {
          try {
            await verifyPhoneOtp('1234567890', '123456');
          } catch (e: any) {
            document.getElementById('error')!.textContent = e.message;
          }
        }}
      >
        Verify Error Network
      </button>
      <div id="result" data-testid="result"></div>
      <div id="error" data-testid="error"></div>
    </div>
  );
};

describe('AuthContext OTP Testing', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('verifyPhoneOtp should return data when successful', async () => {
    const mockData = { success: true, verified: true, message: 'Success' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByTestId('verify-success');
    userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent(JSON.stringify(mockData));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/verify-phone-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '1234567890', otp: '123456' }),
    });
  });

  it('verifyPhoneOtp should throw specific error when API fails with an error message', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Custom API error message' }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByTestId('verify-error-specific');
    userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Custom API error message');
    });
  });

  it('verifyPhoneOtp should throw default error when API fails without specific error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByTestId('verify-error-default');
    userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid verification code. Please try again.');
    });
  });

  it('verifyPhoneOtp should catch network error and throw default error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network disconnected'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByTestId('verify-error-network');
    userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network disconnected');
    });
  });
});

  describe('sendPhoneOtp testing', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

    it('sendPhoneOtp should return data when successful', async () => {
      const mockData = { success: true, message: 'OTP Sent' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const TestSendComponent = () => {
        const { sendPhoneOtp } = useAuth();
        return (
          <button
            data-testid="send-otp"
            onClick={async () => {
              try {
                const data = await sendPhoneOtp('1234567890');
                document.getElementById('result-send')!.textContent = JSON.stringify(data);
              } catch (e: any) {
                document.getElementById('error-send')!.textContent = e.message;
              }
            }}
          >
            Send OTP
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestSendComponent />
          <div id="result-send" data-testid="result-send"></div>
          <div id="error-send" data-testid="error-send"></div>
        </AuthProvider>
      );

      const button = screen.getByTestId('send-otp');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('result-send')).toHaveTextContent(JSON.stringify(mockData));
      });
    });

    it('sendPhoneOtp should return fallback success when API fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network issue'));

      const TestSendComponent = () => {
        const { sendPhoneOtp } = useAuth();
        return (
          <button
            data-testid="send-otp-error"
            onClick={async () => {
              try {
                const data = await sendPhoneOtp('1234567890');
                document.getElementById('result-send')!.textContent = JSON.stringify(data);
              } catch (e: any) {
                document.getElementById('error-send')!.textContent = e.message;
              }
            }}
          >
            Send OTP
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestSendComponent />
          <div id="result-send" data-testid="result-send"></div>
          <div id="error-send" data-testid="error-send"></div>
        </AuthProvider>
      );

      const button = screen.getByTestId('send-otp-error');
      await userEvent.click(button);

      const fallbackMock = {
        success: true,
        message: 'Verification code sent to 1234567890 and your email',
        expiresInSeconds: 600
      };

      await waitFor(() => {
        expect(screen.getByTestId('result-send')).toHaveTextContent(JSON.stringify(fallbackMock));
      });
    });
  });
