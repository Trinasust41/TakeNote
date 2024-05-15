import { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import "./assets/css/app.css";
import { Navbar } from "./components/Navbar";
import { NoteCard } from "./components/NoteCard";
import { NoteDetails } from "./components/NoteDetails";
import { UpsertNote } from "./components/UpsertNote";
import { PaletteContext } from "./context/PaletteContext";
import LoadingSpinner from './components/LoadingSpinner';

const palettes = [
  { id: 1, color: "#0d1282", name: "blue-palette" },
  { id: 2, color: "#F5BD02", name: "rose-palette" },
  { id: 3, color: "#90EE90", name: "violet-palette" },
  { id: 4, color: "#333", name: "black-palette" },
];

export default function App() {
  const { state, dispatch } = useContext(PaletteContext);
  const [onCreateNote, setOnCreateNote] = useState(false);
  const [onViewNote, setOnViewNote] = useState(false);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPalette, setCurrentPalette] = useState(
    state?.palette
      ? palettes.find((p) => p.id === state.palette.id)
      : palettes[0]
  );

  useEffect(() => {
    const tempNotes = JSON.parse(localStorage.getItem("notes"));
    tempNotes && setNotes(tempNotes);
  }, []);

  const saveNotes = (items) => {
    localStorage.setItem("notes", JSON.stringify(items));
  };

  const handleCreateNote = (note) => {
    setIsLoading(true);
    setTimeout(() => {
      if (note) {
        const tempNotes = [...notes, note];
        setNotes(tempNotes);
        saveNotes(tempNotes);
        toast.success('Note added successfully!');
      }
      setIsLoading(false);
    }, 3000); // 3 seconds
  };

  const handleOnUpdate = (note) => {
    setCurrentNote(note);
    setOnCreateNote(true);
  };

  const handleUpdateNote = (note) => {
    setIsLoading(true);
    setTimeout(() => {
      if (note) {
        const tempNotes = notes.map((n) => (n.id === note.id ? note : n));
        setNotes(tempNotes);
        setCurrentNote(null);
        saveNotes(tempNotes);
        toast.info('Note edited successfully!');
      }
      setIsLoading(false);
    }, 3000); // 3 seconds
  };

  const handleDeleteNote = (noteId) => {
    setIsLoading(true);
    setTimeout(() => {
      const tempNotes = notes.filter((n) => n.id !== noteId);
      setNotes(tempNotes);
      saveNotes(tempNotes);
      toast.error('Note deleted successfully!');
      setIsLoading(false);
    }, 3000); // 3 seconds
  };

  const handleOnPreview = (note) => {
    setCurrentNote(note);
    setOnViewNote(true);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`app ${
        state?.palette ? state?.palette?.name : currentPalette?.name
      }`}
    >
      <Navbar
        setOpen={setOnCreateNote}
        state={state}
        dispatch={dispatch}
        setCurrentPalette={setCurrentPalette}
        palettes={palettes}
        currentPalette={currentPalette}
      />
      <div className="wrapper container">
        <div className="search-wrapper">
          <input
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            type="text"
            className="search-input"
            placeholder="Search"
          />
          <button className="search-btn">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="notes-wrapper">
            <TransitionGroup>
              {filteredNotes.map((note) => (
                <CSSTransition
                  key={note.id}
                  timeout={500}
                  classNames="note"
                >
                  <NoteCard
                    key={note?.id}
                    note={note}
                    onDelete={handleDeleteNote}
                    onUpdate={handleOnUpdate}
                    onPreview={handleOnPreview}
                  />
                </CSSTransition>
              ))}
            </TransitionGroup>
          </div>
        )}
        {onCreateNote && (
          <UpsertNote
            note={currentNote}
            createNote={handleCreateNote}
            updateNote={handleUpdateNote}
            setOpen={setOnCreateNote}
          />
        )}
        {onViewNote && (
          <NoteDetails note={currentNote} setView={setOnViewNote} />
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
