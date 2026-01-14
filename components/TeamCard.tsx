import React from 'react';
import { Team } from '../types';
import GaugeSemicircleNeedle from './GaugeSemicircleNeedle';
import { ChevronRight, Trophy } from 'lucide-react';
import { API_COLORS } from '../constants';

interface TeamCardProps {
  team: Team;
  onClick: (team: Team) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 cursor-pointer p-4 relative overflow-hidden group"
      onClick={() => onClick(team)}
    >
      {/* Rank Badge */}
      <div className="absolute top-0 left-0 bg-api-accent text-white px-3 py-1 rounded-br-lg text-sm font-semibold z-10 flex items-center gap-1">
        <Trophy size={14} />
        Rank #{team.rank}
      </div>

      <div className="flex flex-col items-center mt-6">
        <GaugeSemicircleNeedle 
          percent={team.percentComplete} 
          size={180} 
          label={`${team.name} progress`}
        />
        
        <h3 className="text-lg font-bold text-api-blue mt-[-20px] mb-1 text-center group-hover:text-api-accent transition-colors">
          {team.name}
        </h3>

        <div className="w-full grid grid-cols-2 gap-2 mt-4 text-center text-sm border-t border-gray-100 pt-3">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs uppercase tracking-wider">Tasks</span>
            <span className="font-semibold text-api-gray">
              {team.completedTaskCount} / {team.tasksRequired}
            </span>
          </div>
          <div className="flex flex-col border-l border-gray-100">
            <span className="text-gray-400 text-xs uppercase tracking-wider">Points</span>
            <span className="font-bold text-api-blue">{team.points}</span>
          </div>
        </div>
      </div>
      
      {/* Tooltip Overlay (Visible on Hover via CSS group) */}
      <div className="absolute inset-0 bg-api-blue/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center pointer-events-none">
        <p className="font-semibold mb-2">View Details</p>
        <p className="text-sm opacity-90">{team.name} is {team.percentComplete}% complete.</p>
        <ChevronRight className="mt-2" />
      </div>
    </div>
  );
};

export default TeamCard;