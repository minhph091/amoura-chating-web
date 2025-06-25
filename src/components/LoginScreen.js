import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Heart, Sparkles } from './Icons';

const EMAIL_STORAGE_KEY = 'amoura_email';

const LoginScreen = React.memo(({ onLoginSuccess, apiRequest }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        // Tự động điền lại email nếu có trong localStorage
        const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
        if (savedEmail) {
            setEmail(savedEmail);
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
                    email,
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4 transition-all duration-500">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main login card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 space-y-8 transition-all duration-500 hover:shadow-3xl">
                    
                    {/* Logo and Brand */}
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            {/* Animated heart background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                            <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <Heart size={32} className="text-white animate-pulse" />
                            </div>
                        </div>
                        
                        {/* Brand name with beautiful typography */}
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-pulse">
                                amoura
                            </h1>
                            <div className="flex items-center justify-center space-x-1">
                                <Sparkles size={16} className="text-pink-400 animate-bounce" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Nơi kết nối những trái tim
                                </p>
                                <Sparkles size={16} className="text-purple-400 animate-bounce delay-75" />
                            </div>
                        </div>
                    </div>

                    {/* Login form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mr-2"></span>
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="Nhập email của bạn"
                                />
                                <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-pink-400 to-purple-500 rounded-r-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full mr-2"></span>
                                Mật khẩu
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 pr-12"
                                    placeholder="Nhập mật khẩu"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute inset-y-0 right-0 px-4 text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-r-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                                        rememberMe 
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent' 
                                            : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-400'
                                    }`}>
                                        {rememberMe && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 transition-colors duration-200">
                                    Ghi nhớ đăng nhập
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    {error}
                                </p>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:via-gray-600 dark:disabled:to-gray-600 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Đang đăng nhập...</span>
                                </div>
                            ) : (
                                <span>Đăng nhập</span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Bằng cách đăng nhập, bạn đồng ý với{' '}
                            <span className="text-purple-500 hover:text-purple-600 cursor-pointer transition-colors duration-200">
                                Điều khoản sử dụng
                            </span>
                        </p>
                    </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-60 animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full opacity-60 animate-bounce delay-1000"></div>
            </div>
        </div>
    );
});

export default LoginScreen; 