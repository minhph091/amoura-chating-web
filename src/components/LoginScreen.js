import React, { useState, useEffect, useRef } from 'react';
import nightsky from '../assets/images/nightsky.jpg';

const EMAIL_STORAGE_KEY = 'amoura_email';

const LoginScreen = React.memo(({ onLoginSuccess, apiRequest }) => {
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [language, setLanguage] = useState('vi');
    const isMounted = useRef(true);
    const visualPaneRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    // Language data
    const langData = {
        vi: {
            page_title: "Đăng nhập - Amoura",
            slogan: "Nơi những vì sao dẫn lối cho tình yêu bắt đầu.",
            welcome: "Chào mừng trở lại",
            prompt: "Đăng nhập để tiếp tục cuộc hành trình của bạn.",
            placeholder_credential: "Email hoặc Số điện thoại",
            placeholder_password: "Mật khẩu",
            login_button: "Đăng Nhập",
            remember_me: "Ghi nhớ đăng nhập",
            forgot_password: "Quên mật khẩu?",
            no_account_prefix: "Chưa có tài khoản? Đăng ký tại ",
            register_link_brand: "Amoura",
        },
        en: {
            page_title: "Login - Amoura",
            slogan: "Where stars align for love to begin.",
            welcome: "Welcome Back",
            prompt: "Login to continue your journey.",
            placeholder_credential: "Email or Phone Number",
            placeholder_password: "Password",
            login_button: "Login",
            remember_me: "Remember me",
            forgot_password: "Forgot password?",
            no_account_prefix: "Don't have an account? Sign up at ",
            register_link_brand: "Amoura",
        }
    };

    useEffect(() => {
        isMounted.current = true;
        // Tự động điền lại email nếu có trong localStorage
        const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
        if (savedEmail) {
            setCredential(savedEmail);
        }

        // Add parallax effect
        const visualPane = visualPaneRef.current;
        if (visualPane) {
            const handleMouseMove = (e) => {
                const { clientWidth, clientHeight } = visualPane;
                const x = (e.clientX / clientWidth) - 0.5;
                const y = (e.clientY / clientHeight) - 0.5;

                // Adjust the numbers (20) to control the parallax intensity
                visualPane.style.backgroundPosition = `calc(50% + ${-x * 20}px) calc(50% + ${-y * 20}px)`;
            };

            const handleMouseLeave = () => {
                visualPane.style.backgroundPosition = 'center';
            };

            visualPane.addEventListener('mousemove', handleMouseMove);
            visualPane.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                visualPane.removeEventListener('mousemove', handleMouseMove);
                visualPane.removeEventListener('mouseleave', handleMouseLeave);
            };
        }

        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: {
                    email: credential,
                    password,
                    loginType: 'EMAIL_PASSWORD',
                }
            });
            onLoginSuccess(response.accessToken, response.user, rememberMe);
        } catch (err) {
            console.error(err);
            if (isMounted.current) {
                setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row">
            {/* Left Side: Visual & Branding with Parallax and Shooting Star Effect */}
            <div 
                ref={visualPaneRef}
                className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col justify-center items-center text-center p-8 text-white relative overflow-hidden"
                style={{
                    backgroundImage: `url(${nightsky})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'background-position 0.4s ease-out'
                }}>
                {/* Shooting Stars Container (new, from login.html) */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                    <span className="shooting-star"></span>
                </div>
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black opacity-50"></div>
                
                {/* Branding Content */}
                <div className="relative z-10 animate-fade-in">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-wider text-shadow"
                        style={{ fontFamily: 'Playfair Display, serif' }}>
                        Amoura
                    </h1>
                    <p className="font-light text-xl md:text-2xl mt-4 max-w-md opacity-90">
                        {langData[language].slogan}
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 relative"
                 style={{ backgroundColor: '#110e22' }}>
                {/* Language Switcher */}
                <div className="absolute top-6 right-8 flex items-center gap-2 text-sm text-gray-400 z-10">
                    <button 
                        onClick={() => handleLanguageChange('vi')}
                        className={`hover:text-white transition-colors ${language === 'vi' ? 'text-pink-400 font-medium' : ''}`}>
                        VI
                    </button>
                    <span>/</span>
                    <button 
                        onClick={() => handleLanguageChange('en')}
                        className={`hover:text-white transition-colors ${language === 'en' ? 'text-pink-400 font-medium' : ''}`}>
                        EN
                    </button>
                </div>

                {/* Centering Wrapper */}
                <main className="flex-grow flex items-center justify-center">
                    <div className="w-full max-w-md text-white relative">
                        
                        {/* Header */}
                        <div className="text-left mb-10">
                            <h2 className="text-4xl font-bold animate-fade-in">
                                {langData[language].welcome}
                            </h2>
                            <p className="text-gray-400 mt-2 animate-fade-in animation-delay-200">
                                {langData[language].prompt}
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email/Phone Input */}
                            <div className="relative animate-fade-in animation-delay-400 input-group">
                                <span className="absolute inset-y-0 left-0 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </span>
                                <input 
                                    id="credential" 
                                    name="credential" 
                                    type="text" 
                                    required
                                    value={credential}
                                    onChange={(e) => setCredential(e.target.value)}
                                    className="w-full input-underline placeholder-gray-500 text-white"
                                    placeholder={langData[language].placeholder_credential}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: '0',
                                        paddingLeft: '2.5rem',
                                        paddingBottom: '0.75rem',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative animate-fade-in animation-delay-600 input-group">
                                 <span className="absolute inset-y-0 left-0 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input 
                                    id="password" 
                                    name="password" 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full input-underline placeholder-gray-500 text-white"
                                    placeholder={langData[language].placeholder_password}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: '0',
                                        paddingLeft: '2.5rem',
                                        paddingBottom: '0.75rem',
                                        transition: 'border-color 0.3s ease',
                                        paddingRight: '2.5rem',
                                    }}
                                />
                                {/* Eye icon toggle */}
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                                    onClick={() => setShowPassword(v => !v)}
                                    tabIndex={-1}
                                    style={{ position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: '0 0.75rem', cursor: 'pointer' }}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.01c2.12 3.77 6.07 6.24 10.066 6.24 2.042 0 3.977-.57 5.617-1.56M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.02 3.777A10.477 10.477 0 0022.066 12.01c-2.12-3.77-6.07-6.24-10.066-6.24-2.042 0-3.977.57-5.617 1.56" />
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.857-.676 1.664-1.186 2.393M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.364 6.364A9.956 9.956 0 0112 19c4.478 0 8.268-2.943 9.542-7a9.956 9.956 0 00-1.186-2.393" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm animate-fade-in animation-delay-800">
                                <div className="flex items-center">
                                    <input 
                                        id="remember-me" 
                                        name="remember-me" 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-pink-600 focus:ring-pink-500 focus:ring-offset-gray-800"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-gray-400">
                                        {langData[language].remember_me}
                                    </label>
                                </div>
                                <a href="#" className="font-medium text-gray-400 hover:text-pink-400 transition duration-300">
                                    {langData[language].forgot_password}
                                </a>
                            </div>
                            
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 animate-fade-in">
                                    <p className="text-sm text-red-400 flex items-center">
                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                        {error}
                                    </p>
                                </div>
                            )}
                            
                            {/* Submit Button */}
                            <div className="pt-4 animate-fade-in animation-delay-800">
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded-full font-semibold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#110e22] focus:ring-pink-500 transition-all duration-300 transform hover:scale-105 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Đang đăng nhập...</span>
                                        </div>
                                    ) : (
                                        langData[language].login_button
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Sign up link */}
                        <div className="text-center mt-12 animate-fade-in animation-delay-800">
                            <p className="text-sm text-gray-400">
                                <span>{langData[language].no_account_prefix}</span>
                                <a href="https://amoura.space" target="_blank" rel="noopener noreferrer" className="font-medium text-pink-500 hover:text-pink-400 transition-colors duration-300">
                                    {langData[language].register_link_brand}
                                </a>
                            </p>
                        </div>

                    </div>
                </main>
            </div>

            {/* Custom CSS for animations and effects */}
            <style jsx>{`
                body {
                    font-family: 'Be Vietnam Pro', sans-serif;
                    background-color: #0c0a1a;
                    overflow-x: hidden;
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                    opacity: 0;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animation-delay-200 { animation-delay: 200ms; }
                .animation-delay-400 { animation-delay: 400ms; }
                .animation-delay-600 { animation-delay: 600ms; }
                .animation-delay-800 { animation-delay: 800ms; }
                
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 15px rgba(244, 114, 182, 0.4); }
                    50% { box-shadow: 0 0 25px rgba(244, 114, 182, 0.7); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2.5s infinite ease-in-out;
                }
                
                .input-group:focus-within .input-underline {
                    border-bottom-color: #f472b6;
                }
                .input-group:focus-within .input-icon {
                    color: #f472b6;
                }
                
                .input-underline:focus {
                    outline: none;
                }
                .input-icon {
                    transition: color 0.3s ease;
                }
                
                /* Shooting Star Effect (from login.html, scoped for login only) */
                .shooting-star {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 3px;
                    height: 3px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1), 0 0 0 8px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.1);
                    animation: animate-star 3s linear infinite;
                }
                .shooting-star::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 300px;
                    height: 1px;
                    background: linear-gradient(90deg, #fff, transparent);
                }
                @keyframes animate-star {
                    0% {
                        transform: rotate(315deg) translateX(0);
                        opacity: 1;
                    }
                    70% {
                        opacity: 1;
                    }
                    100% {
                        transform: rotate(315deg) translateX(-1500px);
                        opacity: 0;
                    }
                }
                .shooting-star:nth-child(1) { top: 0; right: 0; left: initial; animation-delay: 0s; animation-duration: 1s; }
                .shooting-star:nth-child(2) { top: 0; right: 80px; left: initial; animation-delay: 0.2s; animation-duration: 3s; }
                .shooting-star:nth-child(3) { top: 80px; right: 0px; left: initial; animation-delay: 0.4s; animation-duration: 2s; }
                .shooting-star:nth-child(4) { top: 0; right: 180px; left: initial; animation-delay: 0.6s; animation-duration: 1.5s; }
                .shooting-star:nth-child(5) { top: 0; right: 400px; left: initial; animation-delay: 0.8s; animation-duration: 2.5s; }
                .shooting-star:nth-child(6) { top: 0; right: 600px; left: initial; animation-delay: 1s; animation-duration: 3.5s; }
                .shooting-star:nth-child(7) { top: 300px; right: 0px; left: initial; animation-delay: 1.2s; animation-duration: 1.75s; }
                .shooting-star:nth-child(8) { top: 0px; right: 700px; left: initial; animation-delay: 1.4s; animation-duration: 1.25s; }
                .shooting-star:nth-child(9) { top: 0px; right: 1000px; left: initial; animation-delay: 0.75s; animation-duration: 2.25s; }
                .shooting-star:nth-child(10) { top: 0px; right: 450px; left: initial; animation-delay: 2.75s; animation-duration: 2.75s; }

                /* Autofill fix for input fields */
                input:-webkit-autofill,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:active {
                  -webkit-box-shadow: 0 0 0 1000px #110e22 inset !important;
                  box-shadow: 0 0 0 1000px #110e22 inset !important;
                  -webkit-text-fill-color: #fff !important;
                  caret-color: #fff !important;
                  transition: background-color 9999s ease-in-out 0s;
                }
            `}</style>
        </div>
    );
});

export default LoginScreen; 