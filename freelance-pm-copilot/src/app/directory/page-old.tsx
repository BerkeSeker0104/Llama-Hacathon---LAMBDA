'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  User, 
  Star,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { CompanyService, TeamService, PersonService, SkillService } from '@/lib/firestore-service';
import { Company, Team, Person, PersonSkill, Skill } from '@/lib/firestore-schema';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Loading from '@/components/Loading';

export default function DirectoryPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  // State for data
  const [company, setCompany] = useState<Company | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [personSkills, setPersonSkills] = useState<PersonSkill[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // UI state
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    if (!user || !user.companyId) return;

    const loadData = async () => {
      try {
        setDataLoading(true);
        
        // Load company
        const companyData = await CompanyService.getCompany(user.companyId!);
        setCompany(companyData);
        
        // Load teams
        const teamsData = await TeamService.getTeamsByCompany(user.companyId!);
        setTeams(teamsData);
        
        // Load people
        const peopleData = await PersonService.getPeopleByCompany(user.companyId!);
        setPeople(peopleData);
        
        // Load skills
        const skillsData = await SkillService.getAllSkills();
        setSkills(skillsData);
        
        // Load person skills
        const allPersonSkills: PersonSkill[] = [];
        for (const person of peopleData) {
          const personSkillsData = await SkillService.getPersonSkills(person.id);
          allPersonSkills.push(...personSkillsData);
        }
        setPersonSkills(allPersonSkills);
        
      } catch (error) {
        console.error('Error loading directory data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter people based on search and filters
  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = !selectedTeam || person.teamId === selectedTeam;
    
    const matchesSkill = !skillFilter || personSkills.some(ps => 
      ps.personId === person.id && ps.skillKey === skillFilter
    );
    
    return matchesSearch && matchesTeam && matchesSkill;
  });

  // Get person skills
  const getPersonSkills = (personId: string) => {
    return personSkills.filter(ps => ps.personId === personId);
  };

  // Get team people
  const getTeamPeople = (teamId: string) => {
    return people.filter(p => p.teamId === teamId);
  };

  // Get skill level stars
  const getSkillLevelStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Get workload color
  const getWorkloadColor = (workload: number) => {
    if (workload > 80) return 'text-red-600';
    if (workload > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading || dataLoading) {
    return <Loading />;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ResponsiveHeader 
        title="Ekip Dizini"
        subtitle={company ? `${company.name} - ${teams.length} ekip, ${people.length} çalışan` : 'Ekip ve çalışan yönetimi'}
        showQuickActions={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Teams */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Ekipler
                </CardTitle>
                <CardDescription>Şirket ekipleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedTeam === null ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedTeam(null)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Tüm Ekipler ({people.length})
                  </Button>
                  
                  {teams.map(team => {
                    const teamPeople = getTeamPeople(team.id);
                    return (
                      <Button
                        key={team.id}
                        variant={selectedTeam === team.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedTeam(team.id)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {team.name} ({teamPeople.length})
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Skills Filter */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Skill Filtresi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={skillFilter === null ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSkillFilter(null)}
                  >
                    Tüm Skill'ler
                  </Button>
                  
                  {skills.slice(0, 10).map(skill => (
                    <Button
                      key={skill.id}
                      variant={skillFilter === skill.key ? "default" : "outline"}
                      className="w-full justify-start text-xs"
                      onClick={() => setSkillFilter(skill.key)}
                    >
                      {skill.key}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - People */}
          <div className="lg:col-span-3">
            {/* Search and Stats */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Çalışan ara..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={() => router.push('/directory/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Çalışan
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Toplam Çalışan</p>
                        <p className="text-2xl font-bold">{people.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Ortalama Yük</p>
                        <p className="text-2xl font-bold">
                          {people.length > 0 
                            ? Math.round(people.reduce((sum, p) => sum + p.currentWorkload, 0) / people.length)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Toplam Skill</p>
                        <p className="text-2xl font-bold">{skills.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* People Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPeople.map(person => {
                const personSkillsData = getPersonSkills(person.id);
                const team = teams.find(t => t.id === person.teamId);
                
                return (
                  <Card key={person.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{person.name}</CardTitle>
                          <CardDescription>{person.email}</CardDescription>
                        </div>
                        <Badge variant="outline">{person.role}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Team */}
                      {team && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {team.name}
                        </div>
                      )}

                      {/* Workload */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Yük:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${person.currentWorkload > 80 ? 'bg-red-500' : person.currentWorkload > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${person.currentWorkload}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getWorkloadColor(person.currentWorkload)}`}>
                            {person.currentWorkload}%
                          </span>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Müsaitlik:</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">{person.hoursPerWeek}h/hafta</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Skill'ler:</p>
                        <div className="flex flex-wrap gap-1">
                          {personSkillsData.slice(0, 4).map(skill => (
                            <div key={skill.id} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                              <span>{skill.skillKey}</span>
                              <div className="flex">
                                {getSkillLevelStars(skill.level)}
                              </div>
                            </div>
                          ))}
                          {personSkillsData.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{personSkillsData.length - 4} daha
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => router.push(`/directory/${person.id}`)}
                        >
                          Detayları Görüntüle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredPeople.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Çalışan bulunamadı</h3>
                  <p className="text-gray-600 mb-4">
                    Arama kriterlerinize uygun çalışan bulunamadı.
                  </p>
                  <Button onClick={() => {
                    setSearchTerm('');
                    setSelectedTeam(null);
                    setSkillFilter(null);
                  }}>
                    Filtreleri Temizle
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
