import React from 'react';

const SettingsModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
        <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Cài đặt</h3>
            <p>Các tùy chọn cài đặt sẽ được phát triển ở đây.</p>
            <div className="text-center mt-6">
                <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Đóng</button>
            </div>
        </div>
    </div>
);

export default SettingsModal; 