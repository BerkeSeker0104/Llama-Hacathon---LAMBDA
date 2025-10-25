'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompanyService, TeamService, PersonService } from '@/lib/firestore-service';
import { Company, Team, Person } from '@/lib/firestore-schema';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import PersonCard from '@/components/PersonCard';
import { Users, User, Building2, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react';

export default function DirectoryPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // State for real-time data
  const [company, setCompany] = useState<Company | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Toggle team expansion
  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  // Load data
  useEffect(() => {
    if (!user) return;

    setDataLoading(true);

    // B2B: Load company data if user has companyId
    if (user.companyId) {
      // Load company data
      CompanyService.getCompany(user.companyId).then((companyData) => {
        setCompany(companyData);
      });

      // Load teams
      TeamService.getTeamsByCompany(user.companyId).then((teamsData) => {
        setTeams(teamsData);
      });

      // Load people
      PersonService.getPeopleByCompany(user.companyId).then((peopleData) => {
        setPeople(peopleData);
        setDataLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Filter people based on search
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter teams based on search
  const filteredTeams = teams.filter(team => {
    const teamMembers = people.filter(p => p.teamId === team.id);
    return team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teamMembers.some(member =>
             member.name.toLowerCase().includes(searchTerm.toLowerCase())
           );
  });

  if (loading || dataLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />

      <div className="lg:pl-64">
        <PageHeader
          title="Team Directory"
          description="Company hierarchy and team members"
          breadcrumbs={[
            { label: 'Directory', href: '/directory' }
          ]}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Organization Structure</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search people, roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-[#00ff88] focus:outline-none"
                  />
                </div>
                <Button variant="outline" className="glass-button text-white border-[#00ff88] hover:bg-[#00ff88]/10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Company Overview */}
            {company && (
              <div className="glass-card p-4 mb-6 bg-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-8 w-8 text-[#00ff88]" />
                    <div>
                      <h3 className="text-xl font-bold text-white">{company.name}</h3>
                      <p className="text-gray-400">{company.industry}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-[#00ff88]/20 text-[#00ff88] mb-2">
                      {company.licenseType} license
                    </Badge>
                    <p className="text-sm text-gray-400">
                      {filteredTeams.length} teams • {filteredPeople.length} members
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Teams Hierarchy */}
            <div className="space-y-4">
              {filteredTeams.map((team) => {
                const teamMembers = filteredPeople.filter(p => p.teamId === team.id);
                const isExpanded = expandedTeams.has(team.id);

                return (
                  <div key={team.id} className="glass-card p-4 hover-glow">
                    {/* Team Header */}
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleTeam(team.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                          <p className="text-sm text-gray-400">{team.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge className="bg-[#00ff88]/20 text-[#00ff88]">
                          {teamMembers.length} members
                        </Badge>
                        <div className="flex items-center text-sm text-gray-400">
                          <User className="h-4 w-4 mr-1" />
                          {teamMembers.filter(m => m.role === 'manager').length} manager
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {teamMembers.map((person) => (
                            <div key={person.id} className="glass-card p-4 bg-black/20 hover-glow">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-medium text-white">{person.name}</p>
                                  <p className="text-sm text-gray-400">{person.email}</p>
                                </div>
                                <Badge className={
                                  person.role === 'manager' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                                  person.role === 'lead' ? 'bg-blue-400/20 text-blue-400' :
                                  'bg-gray-400/20 text-gray-400'
                                }>
                                  {person.role}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Workload</span>
                                  <span className="text-white">{person.currentWorkload}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      person.currentWorkload > 80 ? 'bg-red-400' :
                                      person.currentWorkload > 60 ? 'bg-orange-400' : 'bg-[#00ff88]'
                                    }`}
                                    style={{ width: `${person.currentWorkload}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Available</span>
                                  <span className="text-white">{person.hoursPerWeek}h/week</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* All People List (Alternative View) */}
            <div className="glass-card p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">All Team Members</h3>
                <Badge className="bg-gray-600 text-white">
                  {filteredPeople.length} total
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeople.map((person) => (
                  <div key={person.id} className="glass-card p-4 bg-black/20 hover-glow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-white">{person.name}</p>
                        <p className="text-sm text-gray-400">{person.email}</p>
                      </div>
                      <Badge className={
                        person.role === 'manager' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                        person.role === 'lead' ? 'bg-blue-400/20 text-blue-400' :
                        'bg-gray-400/20 text-gray-400'
                      }>
                        {person.role}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Workload</span>
                        <span className="text-white">{person.currentWorkload}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            person.currentWorkload > 80 ? 'bg-red-400' :
                            person.currentWorkload > 60 ? 'bg-orange-400' : 'bg-[#00ff88]'
                          }`}
                          style={{ width: `${person.currentWorkload}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Available</span>
                        <span className="text-white">{person.hoursPerWeek}h/week</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
