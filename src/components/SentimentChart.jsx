import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const SentimentChart = ({ sentiment }) => {
  if (!sentiment) return null;

  const data = [
    { name: 'Score', value: sentiment.score * 100 },
    { name: 'Remaining', value: 100 - (sentiment.score * 100) }
  ];

  const COLORS = sentiment.label === 'POSITIVE' ? ['#00ff9d', '#1a5653'] : ['#ff4d4d', '#5c1a1a'];

  return (
    <div className="sentiment-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={12}
            outerRadius={16}
            startAngle={90}
            endAngle={90 + (360 * sentiment.score)}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentChart;
