import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEvents } from '@/api/events';
import { Link } from 'react-router-dom';
export default function Events() {
  const [events, setEvents] = useState([]);const [loading, setLoading] = useState(true);const [filters, setFilters] = useState({ search: '', status: '' });
  useEffect(() => {fetchEvents();}, []);
  const fetchEvents = async () => {try {const data = await getEvents(filters);setEvents(data);} catch (error) {console.error('Ошибка загрузки мероприятий:', error);} finally {setLoading(false);}};
  return (<div><h1 className="text-3xl font-bold mb-6">Мероприятия</h1><Card className="mb-6"><CardContent className="pt-6"><div className="flex flex-col md:flex-row gap-4"><Input placeholder="Поиск мероприятий..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})}/><select className="p-2 border rounded-md" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}><option value="">Все статусы</option><option value="active">Активные</option><option value="completed">Завершённые</option></select><Button onClick={fetchEvents}>Найти</Button></div></CardContent></Card>{loading ? (<div>Загрузка...</div>) : events.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{events.map((event: any) => (<Card key={event.id}><CardHeader><CardTitle>{event.title}</CardTitle></CardHeader><CardContent><p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p><div className="space-y-2 mb-4"><div className="text-sm">📍 {event.location}</div><div className="text-sm">👥 {event.approved_count}/{event.required_volunteers}</div></div><Button asChild className="w-full"><Link to={`/events/${event.id}`}>Подробнее</Link></Button></CardContent></Card>))}</div>) : (<div className="text-center py-10">Мероприятий не найдено</div>)}</div>);
}
