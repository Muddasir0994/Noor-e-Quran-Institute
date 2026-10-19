import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, House } from '@phosphor-icons/react';

interface NotFoundPageProps {
  onOpenTrial?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onOpenTrial }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F0E6]">
      <div className="max-w-xl w-full text-center space-y-6 bg-[#FAF7F0] p-8 sm:p-12 rounded-sm border border-[#E7DBC2] shadow-xs">
        
        <div className="w-12 h-12 rounded-sm bg-[#13263D] text-[#A47A46] flex items-center justify-center mx-auto border border-[#A47A46]/30">
          <BookOpen className="w-6 h-6" weight="regular" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#A47A46] bg-[#F5F0E6] px-3 py-1 rounded-sm border border-[#E7DBC2]">
            Error 404 • Page Not Found
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#13263D] font-semibold pt-2">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto font-sans leading-relaxed">
            The page you are looking for might have been moved or does not exist. Please use the navigation links below or return home.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#13263D] text-[#F5F0E6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#0C1A2E] transition-colors cursor-pointer"
          >
            <House className="w-4 h-4" />
            <span>Return Home</span>
          </button>

          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FAF7F0] text-[#13263D] text-xs font-semibold uppercase tracking-wider rounded-sm border border-[#13263D] hover:bg-[#F5F0E6] transition-colors cursor-pointer"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
