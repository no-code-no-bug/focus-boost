'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Circle, Play, Pause, RefreshCcw } from 'lucide-react';
declare module '*.mp3' {
  const src: string;
  export default src;
}

import {rainSound} from '../src/music/rain.mp3'; // Đường dẫn tới file âm thanh rain

interface YouTubeVideo {
  id: string;
  thumbnail: string; // Thay title thành thumbnail
}

interface YouTubeBackgroundProps {
  videoId: string; // Specify that videoId should be a string
}

interface Task {
  text: string;
  completed: boolean;
}

interface Background {
  id: string;
  name: string;
  value: string;
}

interface Props {
  backgrounds: Background[];
  rain: ReturnType<typeof useAudio>; // Type based on the hook return
  birds: ReturnType<typeof useAudio>; // Type based on the hook return
  water: ReturnType<typeof useAudio>; // Type based on the hook return
  wind: ReturnType<typeof useAudio>; // Type based on the hook return
}

const useAudio = (initialVolume = 0.5) => {
  const [volume, setVolume] = useState(initialVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Start as null

  useEffect(() => {
    // Ensure this runs only in the client
    audioRef.current = new Audio(); // Initialize Audio here
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      audioRef.current?.pause(); // Clean up on unmount
    };
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return { volume, setVolume, isPlaying, togglePlay, audioRef };
};

const useTimer = (initialTime = 25 * 60) => {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isActive, time]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTime(initialTime);
    clearInterval(intervalRef.current as NodeJS.Timeout);
    intervalRef.current = null;
  };

  return { time, isActive, toggleTimer, resetTimer };
};

const YouTubeBackground: React.FC<YouTubeBackgroundProps> = ({ videoId }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
  <iframe
    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&mute=1`}
    allow="autoplay; encrypted-media; fullscreen" // Thêm fullscreen ở đây
    allowFullScreen
    className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2"
    style={{ pointerEvents: 'none' }}
  />
</div>


);

const backgrounds: Background[] = [
  { id: 'default', name: 'Default', value: 'bg-gradient-to-br from-gray-900 to-gray-800' },
  { id: 'forest', name: 'Forest', value: 'bg-[url(/placeholder.svg?height=1080&width=1920)] bg-cover bg-center' },
  { id: 'ocean', name: 'Ocean', value: 'bg-[url(/placeholder.svg?height=1080&width=1920)] bg-cover bg-center' },
  { id: 'mountains', name: 'Mountains', value: 'bg-[url(/placeholder.svg?height=1080&width=1920)] bg-cover bg-center' },
  { id: 'youtube', name: 'YouTube Video', value: 'youtube' },
];

export function ProductivityAppComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const { time, isActive, toggleTimer, resetTimer } = useTimer();
  const rain = useAudio(rainSound);
  const birds = useAudio();
  const water = useAudio();
  const wind = useAudio();
  const [background, setBackground] = useState<Background>(backgrounds[0]);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const youtubeVideos: YouTubeVideo[] = [
    { id: 'R6MNlWagZhk', thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_1/hqdefault.jpg' },
    { id: 'IlC45w0-KGM', thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_2/hqdefault.jpg' },
    { id: 'JdqL89ZZwFw', thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_3/hqdefault.jpg' },
    { id: 'JuJZ4tZIuc4', thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_3/hqdefault.jpg' },
    { id: 'zhDwjnYZiCo', thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_3/hqdefault.jpg' },
    // Thêm các video khác ở đây
  ];
  
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackgroundChange = (value: string) => {
    const selectedBackground = backgrounds.find(bg => bg.id === value);
    if (selectedBackground) {
      setBackground(selectedBackground);
      if (selectedBackground.id === 'youtube') {
        setYoutubeVideoId('');
      }
    }
  };

  return (
    <div className={`min-h-screen ${background.value !== 'youtube' ? background.value : ''} text-white p-8 relative`}>
      {background.id === 'youtube' && youtubeVideoId && (
        <YouTubeBackground videoId={youtubeVideoId} />
      )}
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Productivity Oasis</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
              <form onSubmit={addTask} className="flex mb-4">
                <Input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task"
                  className="flex-grow mr-2 bg-gray-700 text-white"
                />
                <Button type="submit">Add</Button>
              </form>
              <ul className="space-y-2">
                {tasks.map((task, index) => (
                  <li
                    key={index}
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleTask(index)}
                  >
                    {task.completed ? (
                      <CheckCircle className="mr-2 text-green-500" />
                    ) : (
                      <Circle className="mr-2" />
                    )}
                    <span className={task.completed ? 'line-through' : ''}>{task.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Timer</h2>
              <div className="text-6xl font-bold text-center mb-4">{formatTime(time)}</div>
              <div className="flex justify-center space-x-4">
                <Button onClick={toggleTimer}>
                  {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={resetTimer} variant="outline">
                  <RefreshCcw className="mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Ambient Sounds</h2>
              <div className="space-y-4">
                {[
                  { name: 'Rain', audio: rain },
                  { name: 'Birds', audio: birds },
                  { name: 'Water', audio: water },
                  { name: 'Wind', audio: wind },
                ].map((sound) => (
                  <div key={sound.name} className="flex items-center justify-between">
                    <span>{sound.name}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={sound.audio.isPlaying ? 'outline' : 'default'}
                        onClick={sound.audio.togglePlay}
                      >
                        {sound.audio.isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[sound.audio.volume]}
                        onValueChange={(value) => sound.audio.setVolume(value[0])}
                        aria-label={`${sound.name} volume`}
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Backgrounds</h2>
              <Select onValueChange={handleBackgroundChange} defaultValue={background.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  {backgrounds.map((bg) => (
                    <SelectItem key={bg.id} value={bg.id}>
                      {bg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {background.id === 'youtube' && (
  <Select
    onValueChange={(value: string) => setYoutubeVideoId(value)}
    
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Chọn Video YouTube" />
    </SelectTrigger>
    <SelectContent>
      {youtubeVideos.map((video) => (
        <SelectItem key={video.id} value={video.id} className="flex items-center">
          <img src={video.thumbnail} alt={`Thumbnail for ${video.id}`} className="w-16 h-16 mr-2" />
           {/* Hoặc có thể bỏ span này nếu không cần hiển thị id */}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
