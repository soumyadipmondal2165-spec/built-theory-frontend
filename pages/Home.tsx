
import React from 'react';
import { ToolCard } from '../components/ToolCard';
import { TOOLS } from '../constants';

export const Home: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-white pt-16 pb-20 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Every tool you need to work with PDFs in one place
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Get Started</button>
            <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors">Explore All</button>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-slate-50 py-16 border-y">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">The PDF software trusted by millions</h2>
          <p className="text-gray-500 mb-12">Built-Theory PDF is your number one web app for editing PDF with ease. Enjoy all the tools you need to work efficiently with your digital documents while keeping your data safe and secure.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-4">
              <div className="text-3xl font-bold text-red-600 mb-1">500k+</div>
              <div className="text-sm text-gray-500 font-medium">Users Monthly</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-red-600 mb-1">20+</div>
              <div className="text-sm text-gray-500 font-medium">Free Tools</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-red-600 mb-1">100%</div>
              <div className="text-sm text-gray-500 font-medium">Secure</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-red-600 mb-1">Free</div>
              <div className="text-sm text-gray-500 font-medium">Always</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
