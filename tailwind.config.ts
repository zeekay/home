
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		fontFamily: {
			sans: [
				'-apple-system',
				'BlinkMacSystemFont',
				'"SF Pro Display"',
				'"SF Pro Text"',
				'Geist',
				'system-ui',
				'sans-serif'
			],
			mono: [
				'"SF Mono"',
				'"Geist Mono"',
				'ui-monospace',
				'monospace'
			],
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-left': {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-right': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'terminal-cursor': {
					'0%': { opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'typing': {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				},
				'float': {
					'0%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
					'100%': { transform: 'translateY(0px)' }
				},
				'dock-bounce': {
					'0%, 100%': { transform: 'translateY(0)' },
					'20%': { transform: 'translateY(-16px)' },
					'40%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
					'60%': { transform: 'translateY(0)' },
					'70%': { transform: 'translateY(-5px)' },
					'80%': { transform: 'translateY(0)' }
				},
				// Dock attention bounce - more pronounced for getting attention
				'dock-attention': {
					'0%, 100%': { transform: 'translateY(0)' },
					'15%': { transform: 'translateY(-22px)' },
					'30%': { transform: 'translateY(0)' },
					'45%': { transform: 'translateY(-18px)' },
					'55%': { transform: 'translateY(0)' },
					'65%': { transform: 'translateY(-12px)' },
					'75%': { transform: 'translateY(0)' },
					'85%': { transform: 'translateY(-6px)' },
				},
				// Dock item slide in from bottom
				'dock-slide-in': {
					'0%': { transform: 'translateY(60px)', opacity: '0' },
					'60%': { transform: 'translateY(-4px)', opacity: '1' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				// Dock hide/show animation
				'dock-hide': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(calc(100% + 20px))' }
				},
				'dock-show': {
					'0%': { transform: 'translateY(calc(100% + 20px))' },
					'100%': { transform: 'translateY(0)' }
				},
				// macOS Window Open - Apple's cubic-bezier(0.16, 1, 0.3, 1)
				'window-open': {
					'0%': {
						transform: 'scale(0.8)',
						opacity: '0',
					},
					'60%': {
						transform: 'scale(1.02)',
						opacity: '1',
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1',
					}
				},
				// macOS Window Close - Scale to center effect
				'window-close': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1',
					},
					'100%': {
						transform: 'scale(0.85)',
						opacity: '0',
					}
				},
				// macOS Genie Minimize Effect
				'window-minimize': {
					'0%': {
						transform: 'perspective(1000px) translateY(0) scale(1) rotateX(0deg)',
						opacity: '1',
						transformOrigin: 'bottom center',
					},
					'30%': {
						transform: 'perspective(800px) translateY(30%) scale(0.8) rotateX(3deg)',
						opacity: '1',
					},
					'60%': {
						transform: 'perspective(600px) translateY(60%) scale(0.5) rotateX(6deg)',
						opacity: '0.8',
					},
					'100%': {
						transform: 'perspective(400px) translateY(100%) scale(0.1) rotateX(10deg)',
						opacity: '0',
						transformOrigin: 'bottom center',
					}
				},
				// macOS Genie Restore Effect
				'window-restore': {
					'0%': {
						transform: 'perspective(400px) translateY(100%) scale(0.1) rotateX(10deg)',
						opacity: '0',
						transformOrigin: 'bottom center',
					},
					'40%': {
						transform: 'perspective(600px) translateY(60%) scale(0.5) rotateX(6deg)',
						opacity: '0.8',
					},
					'70%': {
						transform: 'perspective(800px) translateY(30%) scale(0.8) rotateX(3deg)',
						opacity: '1',
					},
					'100%': {
						transform: 'perspective(1000px) translateY(0) scale(1) rotateX(0deg)',
						opacity: '1',
						transformOrigin: 'bottom center',
					}
				},
				// macOS Zoom Maximize Effect
				'window-maximize': {
					'0%': {
						transform: 'scale(1)',
					},
					'50%': {
						transform: 'scale(1.02)',
					},
					'100%': {
						transform: 'scale(1)',
					}
				},
				// macOS Shake Effect (invalid action)
				'window-shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%': { transform: 'translateX(-10px)' },
					'20%': { transform: 'translateX(10px)' },
					'30%': { transform: 'translateX(-10px)' },
					'40%': { transform: 'translateX(10px)' },
					'50%': { transform: 'translateX(-6px)' },
					'60%': { transform: 'translateX(6px)' },
					'70%': { transform: 'translateX(-4px)' },
					'80%': { transform: 'translateX(4px)' },
					'90%': { transform: 'translateX(-2px)' },
				},
				// macOS Bounce Effect (attention)
				'window-bounce': {
					'0%, 100%': { transform: 'translateY(0)' },
					'15%': { transform: 'translateY(-20px)' },
					'30%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-14px)' },
					'50%': { transform: 'translateY(0)' },
					'60%': { transform: 'translateY(-8px)' },
					'70%': { transform: 'translateY(0)' },
					'80%': { transform: 'translateY(-4px)' },
				},
				// Sheet slide from title bar
				'sheet-open': {
					'0%': {
						transform: 'translateY(-20px) scaleY(0.95)',
						opacity: '0',
					},
					'100%': {
						transform: 'translateY(0) scaleY(1)',
						opacity: '1',
					}
				},
				'sheet-close': {
					'0%': {
						transform: 'translateY(0) scaleY(1)',
						opacity: '1',
					},
					'100%': {
						transform: 'translateY(-20px) scaleY(0.95)',
						opacity: '0',
					}
				},
				// Popover spring animation
				'popover-open': {
					'0%': {
						transform: 'scale(0.95) translateY(-10px)',
						opacity: '0',
					},
					'100%': {
						transform: 'scale(1) translateY(0)',
						opacity: '1',
					}
				},
				'popover-close': {
					'0%': {
						transform: 'scale(1) translateY(0)',
						opacity: '1',
					},
					'100%': {
						transform: 'scale(0.95) translateY(-5px)',
						opacity: '0',
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-down': 'slide-down 0.4s ease-out',
				'slide-left': 'slide-left 0.4s ease-out',
				'slide-right': 'slide-right 0.4s ease-out',
				'terminal-cursor': 'terminal-cursor 1s infinite',
				'float': 'float 6s ease-in-out infinite',
				'dock-bounce': 'dock-bounce 0.8s cubic-bezier(0.28, 0.84, 0.42, 1)',
				'dock-attention': 'dock-attention 1s cubic-bezier(0.28, 0.84, 0.42, 1)',
				'dock-slide-in': 'dock-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
				'dock-hide': 'dock-hide 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'dock-show': 'dock-show 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				// macOS Window Animations with Apple timing curves
				'window-open': 'window-open 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'window-close': 'window-close 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards',
				'window-minimize': 'window-minimize 0.5s cubic-bezier(0.42, 0, 1, 1) forwards',
				'window-restore': 'window-restore 0.4s cubic-bezier(0, 0, 0.58, 1) forwards',
				'window-maximize': 'window-maximize 0.35s cubic-bezier(0.23, 1, 0.32, 1) forwards',
				'window-shake': 'window-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
				'window-bounce': 'window-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				// Sheet animations
				'sheet-open': 'sheet-open 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards',
				'sheet-close': 'sheet-close 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards',
				// Popover animations with spring physics
				'popover-open': 'popover-open 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
				'popover-close': 'popover-close 0.15s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
