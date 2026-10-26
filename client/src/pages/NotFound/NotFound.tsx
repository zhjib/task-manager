import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
      <div className="text-2xl font-bold text-gray-800">404</div>
      <div className="text-sm text-gray-500">页面不存在</div>
      <Link
        to="/"
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
      >
        返回首页
      </Link>
    </div>
  );
};

export default NotFound;
