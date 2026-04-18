import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('colorway="auto" resolution matrix', () => {
    it('header + light → red', () => {
      render(<Logo theme="light" context="header" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-red.svg'
      );
    });

    it('header + dark → neon', () => {
      render(<Logo theme="dark" context="header" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-neon.svg'
      );
    });

    it('footer + light → black', () => {
      render(<Logo theme="light" context="footer" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-black.svg'
      );
    });

    it('footer + dark → white', () => {
      render(<Logo theme="dark" context="footer" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-white.svg'
      );
    });

    it('mail + light → red', () => {
      render(<Logo theme="light" context="mail" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-red.svg'
      );
    });

    it('mail + dark → neon', () => {
      render(<Logo theme="dark" context="mail" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-neon.svg'
      );
    });
  });

  describe('explicit colorway overrides auto', () => {
    it('colorway="pink-red" renders pink-red variant regardless of theme', () => {
      render(<Logo theme="dark" colorway="pink-red" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-pink-red.svg'
      );
    });

    it('colorway="sand" renders sand variant', () => {
      render(<Logo colorway="sand" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-sand.svg'
      );
    });
  });

  describe('sizing', () => {
    it('size="sm" → height 32', () => {
      render(<Logo size="sm" />);
      expect(screen.getByRole('img')).toHaveAttribute('height', '32');
    });
    it('size="md" → height 40 (default)', () => {
      render(<Logo />);
      expect(screen.getByRole('img')).toHaveAttribute('height', '40');
    });
    it('size="lg" → height 56', () => {
      render(<Logo size="lg" />);
      expect(screen.getByRole('img')).toHaveAttribute('height', '56');
    });
    it('explicit height prop overrides size', () => {
      render(<Logo size="md" height={48} />);
      expect(screen.getByRole('img')).toHaveAttribute('height', '48');
    });
  });

  describe('min-size enforcement', () => {
    it('height < 32 triggers console.warn', () => {
      render(<Logo height={24} />);
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toMatch(/32|minimum/i);
    });
    it('height ≥ 32 does not warn', () => {
      render(<Logo height={32} />);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('renders <img> element (not inline <svg>)', () => {
      render(<Logo />);
      expect(screen.getByRole('img').tagName).toBe('IMG');
    });

    it('passes className through', () => {
      render(<Logo className="custom-class" />);
      expect(screen.getByRole('img')).toHaveClass('custom-class');
    });

    it('sets alt text', () => {
      render(<Logo />);
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Generation AI');
    });
  });
});
