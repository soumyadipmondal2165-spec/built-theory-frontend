
import React from 'react';
import { Link } from 'react-router-dom';
import { PDFTool } from '../types';
import { ICON_MAP } from '../constants';

export const ToolCard: React.FC<{ tool: PDFTool }> = ({ tool }) => {
  const IconComponent = ICON_MAP[tool.icon];

  return (
    <Link 
      to={`/tool/${tool.id}`}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all group flex flex-col items-start text-left relative overflow-hidden"
    >
      {tool.isPremium && (
        <div className="absolute top-3 right-3 bg-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full text-gray-900 tracking-wider uppercase">
          Pro
        </div>
      )}
      {!tool.isPremium && (
        <div className="absolute top-3 right-3 bg-green-100 text-[10px] font-bold px-2 py-0.5 rounded-full text-green-700 tracking-wider uppercase">
          Free
        </div>
      )}
      
      <div className={`${tool.color} p-4 rounded-xl mb-4 text-white group-hover:rotate-6 transition-transform shadow-md`}>
        {IconComponent && <IconComponent size={28} />}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
        {tool.name}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {tool.description}
      </p>
    </Link>
  );
};
