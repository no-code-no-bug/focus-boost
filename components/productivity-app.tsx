'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Circle, Play, Pause, RefreshCcw, Volume2 } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  thumbnail: string;
}

interface YouTubeBackgroundProps {
  videoId: string;
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

const useAudio = (src: string, initialVolume = 0.7) => {
  const [volume, setVolume] = useState(initialVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (src) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
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

  const adjustVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return { volume, adjustVolume, isPlaying, togglePlay };
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
  const resetTimer = (initialTime: number) => {
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
      allow="autoplay; encrypted-media; fullscreen"
      allowFullScreen
      className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2"
      style={{ pointerEvents: 'none' }}
    />
  </div>
);

const backgrounds: Background[] = [
  { id: 'youtube', name: 'list background', value: 'youtube' },
];

export function ProductivityAppComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [customTime, setCustomTime] = useState(25); // Thời gian mặc định là 25 phút
  const { time, isActive, toggleTimer, resetTimer } = useTimer(customTime * 60);
  const rain = useAudio('/music/rain.mp3', 0.7);
  const birds = useAudio('/music/bird.mp3', 0.7);
  const water = useAudio('/music/water.mp3', 0.7);
  const wind = useAudio('/music/wind.mp3', 0.7);
  const nature = useAudio('/music/nature.mp3', 0.7);
  const wood = useAudio('/music/wood.mp3', 0.7);

  const soundsList = [
    { id: 'rain', name: 'Rain', audio: rain },
    { id: 'birds', name: 'Birds', audio: birds },
    { id: 'water', name: 'Water', audio: water },
    { id: 'wind', name: 'Wind', audio: wind },
    { id: 'nature', name: 'Nature', audio: nature },
    { id: 'wood', name: 'Wood', audio: wood },
  ];

  const [background, setBackground] = useState<Background>(backgrounds[0]);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const youtubeVideos: YouTubeVideo[] = [
    { id: 'R6MNlWagZhk', thumbnail: 'https://img.youtube.com/vi/R6MNlWagZhk/hqdefault.jpg' },
    { id: 'IlC45w0-KGM', thumbnail: 'https://img.youtube.com/vi/IlC45w0-KGM/hqdefault.jpg' },
    { id: 'JdqL89ZZwFw', thumbnail: 'https://img.youtube.com/vi/JdqL89ZZwFw/hqdefault.jpg' },
    { id: 'JuJZ4tZIuc4', thumbnail: 'https://img.youtube.com/vi/JuJZ4tZIuc4/hqdefault.jpg' },
    { id: 'zhDwjnYZiCo', thumbnail: 'https://img.youtube.com/vi/zhDwjnYZiCo/hqdefault.jpg' },
  ];

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    if (!isNaN(minutes) && minutes >= 1) {
      setCustomTime(minutes);
      resetTimer(minutes * 60); // Cập nhật lại thời gian cho timer
    }
  };
  
  const [selectedSound, setSelectedSound] = useState<string>('');

  const handleSoundChange = (soundId: string) => {
    const sound = soundsList.find((s) => s.id === soundId);
    if (sound) {
      // Dừng tất cả âm thanh trước khi phát âm thanh mới
      soundsList.forEach((s) => {
        if (s.audio.isPlaying) {
          s.audio.togglePlay();
        }
      });
      sound.audio.togglePlay(); // Phát âm thanh đã chọn
      setSelectedSound(soundId);
    }
  };
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
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold">{formatTime(time)}</div>
                <div>
                  <Button onClick={toggleTimer} className="mr-2">
                    {isActive ? <Pause /> : <Play />}
                  </Button>
                  <Button onClick={() => resetTimer(customTime * 60)}>
                    <RefreshCcw />
                  </Button>
                </div>
              </div>
              <Input
                type="number"
                value={customTime}
                onChange={handleCustomTimeChange}
                className="bg-gray-700"
                min={1} // Đảm bảo thời gian tối thiểu là 1 phút
              />
              <label className="text-sm">Set Timer (minutes)</label>
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
                { name: 'Nature', audio: nature },
                { name: 'Wood', audio: wood },
              ].map((sound) => (
                <div key={sound.name} className="flex items-center justify-between">
                  <span>{sound.name}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={sound.audio.isPlaying ? 'outline' : 'default'}
                      onClick={sound.audio.togglePlay}
                    >
                      {sound.audio.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4" />
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[sound.audio.volume]}
                        onValueChange={(value) => sound.audio.adjustVolume(value[0])}
                        aria-label={`${sound.name} volume`}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            </div>

            <div className="bg-gray-800 bg-opacity-75 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Backgrounds</h2>
                <Select
                  onValueChange={(value: string) => setYoutubeVideoId(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose YouTube Video" />
                  </SelectTrigger>
                  <SelectContent>
                    {youtubeVideos.map((video) => (
                      <SelectItem key={video.id} value={video.id} className="flex items-center">
                        <img src={video.thumbnail} alt={`Thumbnail for ${video.id}`} className="w-16 h-16 mr-2" />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}