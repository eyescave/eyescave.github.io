// Import necessary React hooks
import { useState, useEffect, useRef } from 'react';

// Main App component
function App() {
  // State declarations for managing notes and UI
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  }); // Stores all notes
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Controls side menu visibility
  const [zoom, setZoom] = useState(() => {
    const savedViewState = localStorage.getItem('viewState');
    return savedViewState ? JSON.parse(savedViewState).zoom : 1;
  }); // Controls zoom level
  const [scrollPosition, setScrollPosition] = useState(() => {
    const savedViewState = localStorage.getItem('viewState');
    return savedViewState ? JSON.parse(savedViewState).scrollPosition : { x: 0, y: 0 };
  }); // Tracks scroll position
  const [activeNoteMenu, setActiveNoteMenu] = useState(null); // Controls context menu for notes
  const [draggedNote, setDraggedNote] = useState(null); // Tracks currently dragged note
  const [resizingNote, setResizingNote] = useState(null); // Tracks note being resized
  const [isSelectionMode, setIsSelectionMode] = useState(false); // Controls selection mode
  const [selectionBox, setSelectionBox] = useState(null); // Tracks selection box dimensions
  const [selectedNotes, setSelectedNotes] = useState([]); // Stores selected note IDs
  const [selectionStart, setSelectionStart] = useState(null); // Tracks selection start position
  const [resetViewActive, setResetViewActive] = useState(false); // Controls reset view animation
  const [isMoveMode, setIsMoveMode] = useState(false); // Controls move mode
  const [isDraggingView, setIsDraggingView] = useState(false); // Tracks view dragging
  const [showExampleNote, setShowExampleNote] = useState(false); // Controls example note visibility
  const [gridSize, setGridSize] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings).gridSize : 20;
  }); // Controls grid size
  const [showGridPopup, setShowGridPopup] = useState(false); // Controls grid popup visibility
  const [showSettings, setShowSettings] = useState(false);
  const [showResizeHandles, setShowResizeHandles] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings).showResizeHandles : true;
  }); // Controls resize handles visibility
  const [showColorPicker, setShowColorPicker] = useState(false); // Controls color picker visibility
  const [showSideMenu, setShowSideMenu] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings).showSideMenu : true;
  });

  // Refs for storing values between renders
  const dragOffset = useRef({ x: 0, y: 0 }); // Stores drag offset
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 }); // Stores resize start values
  const lastMousePos = useRef({ x: 0, y: 0 }); // Tracks last mouse position

  // Color options for notes
  const colorOptions = [
    { name: 'Default', value: '#2c2c2e' },
    { name: 'Red', value: '#3a2c2e' },
    { name: 'Green', value: '#2c3a2e' },
    { name: 'Blue', value: '#2c2e3a' },
    { name: 'Yellow', value: '#3a3a2e' },
    { name: 'Purple', value: '#3a2e3a' }
  ];

  // Add this helper function at the top level of the App component
  const calculateMinimumSize = (note) => {
    // Create temporary elements to measure content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.width = 'auto';
    tempDiv.style.whiteSpace = 'nowrap';
    document.body.appendChild(tempDiv);

    // Calculate title width
    tempDiv.textContent = note.title;
    const titleWidth = tempDiv.offsetWidth + 40; // Add padding

    // Calculate content width and height
    let contentWidth = 0;
    let contentHeight = 60; // Base height for title and padding

    if (note.type === 'checklist') {
      note.text.forEach(item => {
        tempDiv.textContent = item.text;
        contentWidth = Math.max(contentWidth, tempDiv.offsetWidth + 60); // Add space for checkbox
        contentHeight += 30; // Height per checklist item
      });
      // Minimum height for empty checklist
      if (note.text.length === 0) contentHeight += 30;
    } else {
      tempDiv.textContent = note.text;
      tempDiv.style.whiteSpace = 'pre-wrap';
      tempDiv.style.width = '200px'; // Minimum width for text measurement
      contentWidth = Math.max(200, tempDiv.offsetWidth + 40);
      contentHeight += tempDiv.offsetHeight + 20;
    }

    document.body.removeChild(tempDiv);

    return {
      width: Math.max(titleWidth, contentWidth, 200),
      height: Math.max(contentHeight, 100)
    };
  };

  // Main effect for handling mouse and keyboard events
  useEffect(() => {
    // Handler for mouse wheel events
    const handleWheel = (e) => {
      if (isMoveMode) {
        e.preventDefault();
        setZoom(prevZoom => {
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          return Math.min(Math.max(prevZoom + delta, 0.5), 3);
        });
      } else if (e.altKey) {
        e.preventDefault();
        setZoom(prevZoom => {
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          return Math.min(Math.max(prevZoom + delta, 0.5), 3);
        });
      } else if (e.ctrlKey) {
        e.preventDefault();
        setScrollPosition(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      } else {
        setScrollPosition(prev => ({
          x: prev.x,
          y: prev.y - e.deltaY
        }));
      }
    };

    // Handler for clicking outside menus
    const handleClickOutside = (e) => {
      if (activeNoteMenu && !e.target.closest('.note-menu') && !e.target.closest('.color-dropdown')) {
        setActiveNoteMenu(null);
        setShowColorPicker(false);
      }
      if (isMenuOpen && !e.target.closest('.side-menu') && !e.target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
      if (showGridPopup && !e.target.closest('.grid-popup') && !e.target.closest('.grid-button')) {
        setShowGridPopup(false);
      }
    };

    // Handler for mouse movement
    const handleMouseMove = (e) => {
      // Handle view dragging
      if (isDraggingView) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        setScrollPosition(prev => ({
          x: prev.x + deltaX / zoom,
          y: prev.y + deltaY / zoom
        }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Handle note dragging
      if (draggedNote) {
        const draggedNoteObj = notes.find(n => n.id === draggedNote);
        if (!draggedNoteObj || draggedNoteObj.locked) return;

        const newX = (e.clientX - dragOffset.current.x) / zoom - scrollPosition.x;
        const newY = (e.clientY - dragOffset.current.y) / zoom - scrollPosition.y;
        
        const deltaX = newX - draggedNoteObj.position.x;
        const deltaY = newY - draggedNoteObj.position.y;
        
        setNotes(notes.map(note => {
          if (selectedNotes.includes(note.id) && !note.locked) {
            return {
              ...note,
              position: {
                x: note.position.x + deltaX,
                y: note.position.y + deltaY
              }
            };
          }
          return note;
        }));
      }

      // Handle note resizing
      if (resizingNote && !isMoveMode) {
        const resizingNoteObj = notes.find(n => n.id === resizingNote.id);
        if (!resizingNoteObj || resizingNoteObj.locked) return;

        const mouseX = (e.clientX / zoom) - scrollPosition.x;
        const mouseY = (e.clientY / zoom) - scrollPosition.y;
        
        setNotes(notes.map(note => {
          if ((selectedNotes.includes(note.id) && selectedNotes.includes(resizingNote.id)) || note.id === resizingNote.id) {
            if (note.locked) return note;
            
            const minSize = calculateMinimumSize(note);
            let newWidth = note.size?.width || 300;
            let newHeight = note.size?.height || 150;

            if (resizingNote.direction.includes('right')) {
              newWidth = Math.max(minSize.width, mouseX - note.position.x);
            }
            if (resizingNote.direction.includes('bottom')) {
              newHeight = Math.max(minSize.height, mouseY - note.position.y);
            }

            return {
              ...note,
              size: {
                width: newWidth,
                height: newHeight
              }
            };
          }
          return note;
        }));
      }

      // Handle selection box
      if (isSelectionMode && selectionStart) {
        const currentX = (e.clientX - scrollPosition.x * zoom) / zoom;
        const currentY = (e.clientY - scrollPosition.y * zoom) / zoom;
        
        const newSelectionBox = {
          x: Math.min(selectionStart.x, currentX),
          y: Math.min(selectionStart.y, currentY),
          width: Math.abs(currentX - selectionStart.x),
          height: Math.abs(currentY - selectionStart.y)
        };
        
        setSelectionBox(newSelectionBox);

        // Calculate which notes are within selection box
        const selectedIds = notes.filter(note => {
          const noteRight = note.position.x + (note.size?.width || 300);
          const noteBottom = note.position.y + (note.size?.height || 150);
          const selectionRight = newSelectionBox.x + newSelectionBox.width;
          const selectionBottom = newSelectionBox.y + newSelectionBox.height;

          return (
            note.position.x < selectionRight &&
            noteRight > newSelectionBox.x &&
            note.position.y < selectionBottom &&
            noteBottom > newSelectionBox.y
          );
        }).map(note => note.id);
        
        setSelectedNotes(selectedIds);
      }
    };

    // Handler for mouse up events
    const handleMouseUp = () => {
      setDraggedNote(null);
      setResizingNote(null);
      setSelectionBox(null);
      setSelectionStart(null);
      setIsDraggingView(false);
    };

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    activeNoteMenu,
    draggedNote,
    resizingNote,
    notes,
    zoom,
    scrollPosition,
    isSelectionMode,
    selectionStart,
    selectedNotes,
    isDraggingView,
    isMoveMode,
    isMenuOpen,
    showGridPopup,
    showColorPicker
  ]);

  // Function to add a new note
  const handleAddNote = (type = 'text') => {
    const lastNote = notes[notes.length - 1];
    const newPosition = lastNote ? {
      x: lastNote.position.x + 20,
      y: lastNote.position.y + 20
    } : {
      x: Math.random() * (window.innerWidth - 400),
      y: Math.random() * (window.innerHeight - 200)
    };

    setNotes([...notes, {
      id: Date.now(),
      title: type === 'checklist' ? 'New Checklist' : 'New Note',
      text: type === 'checklist' ? [{ text: '', checked: false }] : 'Click to edit...',
      position: newPosition,
      size: {
        width: 300,
        height: 150
      },
      isPlaceholder: true,
      locked: false,
      type: type,
      color: '#2c2c2e' // Default color
    }]);
  };

  // Function to delete a note
  const handleDeleteNote = (noteId) => {
    // If in selection mode and the note is selected, delete all selected notes
    if (isSelectionMode && selectedNotes.includes(noteId)) {
      setNotes(notes.filter(note => !selectedNotes.includes(note.id)));
      setSelectedNotes([]);
    } else {
      // Otherwise just delete the single note
      setNotes(notes.filter(note => note.id !== noteId));
    }
    setActiveNoteMenu(null);
  };

  // Function to handle note content changes
  const handleNoteChange = (noteId, newText, field = 'text') => {
    setNotes(notes.map(note => {
      if (note.id === noteId && !note.locked) {
        if (note.type === 'checklist' && field === 'text') {
          // Handle checklist items
          if (Array.isArray(newText)) {
            return {
              ...note,
              text: newText,
              isPlaceholder: false
            };
          }
          const lines = newText.split('\n');
          const checklistItems = lines.map(line => {
            if (line.startsWith('[ ] ') || line.startsWith('[x] ')) {
              return {
                text: line.substring(4),
                checked: line.startsWith('[x] ')
              };
            }
            return {
              text: line,
              checked: false
            };
          });
          return {
            ...note,
            text: checklistItems,
            isPlaceholder: false
          };
        } else {
          return {
            ...note,
            [field]: newText,
            isPlaceholder: false
          };
        }
      }
      return note;
    }));
  };

  // Function to toggle checklist items
  const handleToggleCheckbox = (noteId, index) => {
    setNotes(notes.map(note => {
      if (note.id === noteId && note.type === 'checklist' && !note.locked) {
        const updatedItems = [...note.text];
        updatedItems[index] = {
          ...updatedItems[index],
          checked: !updatedItems[index].checked
        };
        return {
          ...note,
          text: updatedItems
        };
      }
      return note;
    }));
  };

  // Function to handle right-click context menu
  const handleContextMenu = (e, noteId) => {
    e.preventDefault();
    setActiveNoteMenu({
      id: noteId,
      x: e.clientX,
      y: e.clientY
    });
    setShowColorPicker(false);
  };

  // Function to handle note color change
  const handleColorChange = (noteId, color) => {
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          color: color
        };
      }
      return note;
    }));
    setShowColorPicker(false);
    setActiveNoteMenu(null);
  };

  // Function to handle mouse down events on notes
  const handleMouseDown = (e, noteId) => {
    if (isMoveMode) {
      return;
    }
    
    const note = notes.find(n => n.id === noteId);
    if (!note || (note.locked && e.target.tagName !== 'BUTTON')) return;

    if (isSelectionMode) {
      if (e.target.classList.contains('board')) {
        const currentX = (e.clientX - scrollPosition.x * zoom) / zoom;
        const currentY = (e.clientY - scrollPosition.y * zoom) / zoom;
        setSelectionStart({ x: currentX, y: currentY });
      } else if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT' && !e.target.classList.contains('checkbox')) {
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        setDraggedNote(noteId);
        
        if (!selectedNotes.includes(noteId) && !e.shiftKey) {
          setSelectedNotes([noteId]);
        } else if (!selectedNotes.includes(noteId) && e.shiftKey) {
          setSelectedNotes([...selectedNotes, noteId]);
        }
      }
    } else if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT' && !e.target.classList.contains('checkbox')) {
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setDraggedNote(noteId);
      
      if (!selectedNotes.includes(noteId) && !e.shiftKey) {
        setSelectedNotes([noteId]);
      } else if (!selectedNotes.includes(noteId) && e.shiftKey) {
        setSelectedNotes([...selectedNotes, noteId]);
      }
    }
  };

  // Function to handle note resizing
  const handleResizeStart = (e, noteId, direction) => {
    if (isMoveMode) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note || note.locked) return;

    e.stopPropagation();
    resizeStart.current = {
      width: note.size?.width || 300,
      height: note.size?.height || 150,
      x: e.clientX,
      y: e.clientY
    };
    setResizingNote({ id: noteId, direction });
  };

  // Function to reset view position and zoom
  const handleResetView = () => {
    setScrollPosition({ x: 0, y: 0 });
    setZoom(1);
    setResetViewActive(true);
    setTimeout(() => setResetViewActive(false), 300);
  };

  // Function to deselect all notes
  const handleDeselect = () => {
    setSelectedNotes([]);
  };

  // Function to toggle note lock state
  const handleToggleLock = (noteId) => {
    // If in selection mode and the note is selected, toggle lock for all selected notes
    if (isSelectionMode && selectedNotes.includes(noteId)) {
      const targetNote = notes.find(n => n.id === noteId);
      const newLockedState = !targetNote.locked;
      
      setNotes(notes.map(note => 
        selectedNotes.includes(note.id) ? {
          ...note,
          locked: newLockedState
        } : note
      ));
    } else {
      // Otherwise just toggle lock for the single note
      setNotes(notes.map(note =>
        note.id === noteId ? {
          ...note,
          locked: !note.locked
        } : note
      ));
    }
    setActiveNoteMenu(null);
  };

  // Function to handle key down events
  const handleKeyDown = (e, noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.type === 'checklist' && e.key === 'Enter' && !note.locked) {
      e.preventDefault();
      
      // Get the current input's index
      const currentIndex = note.text.findIndex((item, idx) => {
        const input = e.target;
        return input === document.querySelector(`.note[data-id="${noteId}"] .checklist-item:nth-child(${idx + 1}) input`);
      });

      // Create new array with new checkbox inserted after current position
      const newText = [...note.text];
      newText.splice(currentIndex + 1, 0, { text: '', checked: false });
      
      handleNoteChange(noteId, newText, 'text');

      // Focus the new input after render
      setTimeout(() => {
        const newInput = document.querySelector(
          `.note[data-id="${noteId}"] .checklist-item:nth-child(${currentIndex + 2}) input`
        );
        if (newInput) {
          newInput.focus();
        }
      }, 0);
    }
  };

  // Add this effect to save settings
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({
      showResizeHandles,
      gridSize,
      showSideMenu
    }));
  }, [showResizeHandles, gridSize, showSideMenu]);

  // Add this effect to save view state
  useEffect(() => {
    localStorage.setItem('viewState', JSON.stringify({
      scrollPosition,
      zoom
    }));
  }, [scrollPosition, zoom]);

  // Add this effect to save notes
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Render the main application
  return (
    <div className="app">
      {/* Menu button and Side menu */}
      {showSideMenu && (
        <>
          <button 
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>

          <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
            <h2>Menu</h2>
            <div className="example-note-container">
              {/* Example text note */}
              <div 
                className="example-note"
                onClick={() => handleAddNote('text')}
                style={{cursor: 'pointer'}}
              >
                <input 
                  type="text" 
                  value="New Note" 
                  readOnly 
                  className="example-note-title"
                />
                <textarea 
                  value="Click to edit..." 
                  readOnly
                  className="example-note-text"
                />
              </div>
              {/* Example checklist note */}
              <div 
                className="example-note"
                onClick={() => handleAddNote('checklist')}
                style={{cursor: 'pointer'}}
              >
                <input 
                  type="text" 
                  value="New Checklist" 
                  readOnly 
                  className="example-note-title"
                />
                <div className="example-checklist">
                  <div className="checklist-item">
                    <span className="checkbox">☐</span>
                    <span>Add items...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main board */}
      <div 
        className="board"
        onMouseDown={(e) => {
          if (e.target !== e.currentTarget) return;
          
          if (isMoveMode) {
            setIsDraggingView(true);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            return;
          }
          
          if (isSelectionMode) {
            const currentX = (e.clientX - scrollPosition.x * zoom) / zoom;
            const currentY = (e.clientY - scrollPosition.y * zoom) / zoom;
            setSelectionStart({ x: currentX, y: currentY });
          }
        }}
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {/* Render all notes */}
        {notes.map(note => (
          <div
            key={note.id}
            data-id={note.id}
            className={`note ${draggedNote === note.id ? 'dragging' : ''} ${selectedNotes.includes(note.id) && isSelectionMode ? 'selected' : ''} ${note.locked ? 'locked' : ''}`}
            style={{
              position: 'absolute',
              transform: `scale(${zoom})`,
              left: note.position.x + scrollPosition.x,
              top: note.position.y + scrollPosition.y,
              cursor: note.locked ? 'not-allowed' : (draggedNote === note.id ? 'grabbing' : 'grab'),
              width: note.size?.width || 300,
              height: note.size?.height || 150,
              pointerEvents: isMoveMode ? 'none' : 'auto',
              border: selectedNotes.includes(note.id) && isSelectionMode ? '2px solid #28cd41' : '1px solid #2c2c2e',
              background: note.color || '#2c2c2e'
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
            onContextMenu={(e) => handleContextMenu(e, note.id)}
          >
            {/* Note title */}
            <input
              type="text"
              value={note.title}
              onChange={(e) => handleNoteChange(note.id, e.target.value, 'title')}
              className="note-title"
              readOnly={note.locked}
            />
            {/* Note content - either checklist or text */}
            {note.type === 'checklist' ? (
              <div 
                className="checklist-container"
                style={{
                  height: (note.size?.height || 150) - 60,
                  overflow: 'hidden',
                  minHeight: 90
                }}
              >
                {note.text.map((item, index) => (
                  <div key={index} className="checklist-item">
                    <span 
                      className={`checkbox ${item.checked ? 'checked' : ''}`}
                      onClick={() => !note.locked && handleToggleCheckbox(note.id, index)}
                    >
                      {item.checked ? '✓' : ''}
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        const newItems = [...note.text];
                        newItems[index] = {
                          ...newItems[index],
                          text: e.target.value
                        };
                        handleNoteChange(note.id, newItems, 'text');
                      }}
                      onKeyDown={(e) => handleKeyDown(e, note.id)}
                      readOnly={note.locked}
                      className="checklist-input"
                    />
                  </div>
                ))}
                {note.text.length === 0 && !note.locked && (
                  <div 
                    className="checklist-placeholder"
                    onClick={(e) => {
                      handleNoteChange(note.id, [{ text: '', checked: false }], 'text');
                    }}
                  >
                    Click to add items...
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={note.isPlaceholder ? 'Click to edit...' : note.text}
                onChange={(e) => handleNoteChange(note.id, e.target.value)}
                onFocus={() => {
                  if (note.isPlaceholder && !note.locked) {
                    handleNoteChange(note.id, '');
                  }
                }}
                className={`note-text ${note.isPlaceholder ? 'placeholder' : ''}`}
                style={{
                  height: (note.size?.height || 150) - 60
                }}
                readOnly={note.locked}
              />
            )}
            {/* Resize handles */}
            {!note.locked && showResizeHandles && (
              <div className="resize-dots">
                <div 
                  className="resize-dot bottom"
                  onMouseDown={(e) => handleResizeStart(e, note.id, ['bottom'])}
                />
                <div 
                  className="resize-dot right"
                  onMouseDown={(e) => handleResizeStart(e, note.id, ['right'])}
                />
                <div 
                  className="resize-dot corner"
                  onMouseDown={(e) => handleResizeStart(e, note.id, ['bottom', 'right'])}
                />
              </div>
            )}
            {/* Lock indicator */}
            {note.locked && (
              <div className="lock-indicator">🔒</div>
            )}
          </div>
        ))}
        
        {/* Selection box */}
        {selectionBox && isSelectionMode && (
          <div
            className="selection-box"
            style={{
              position: 'absolute',
              left: selectionBox.x + scrollPosition.x,
              top: selectionBox.y + scrollPosition.y,
              width: selectionBox.width,
              height: selectionBox.height,
              transform: `scale(${zoom})`
            }}
          />
        )}
        
        {/* Context menu */}
        {activeNoteMenu && (
          <>
            <div 
              className="note-menu"
              style={{
                position: 'fixed',
                left: activeNoteMenu.x,
                top: activeNoteMenu.y
              }}
            >
              <button onClick={() => handleToggleLock(activeNoteMenu.id)}>
                {notes.find(n => n.id === activeNoteMenu.id)?.locked ? 'Unlock Note' : 'Lock Note'}
              </button>
              <button onClick={() => setShowColorPicker(!showColorPicker)}>
                Change Color
              </button>
              <button onClick={() => handleDeleteNote(activeNoteMenu.id)}>
                Delete Note
              </button>
            </div>
            {showColorPicker && (
              <div 
                className="color-dropdown"
                style={{
                  position: 'fixed',
                  left: activeNoteMenu.x + 150,
                  top: activeNoteMenu.y
                }}
              >
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    className="color-option"
                    style={{ background: color.value }}
                    onClick={() => handleColorChange(activeNoteMenu.id, color.value)}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Deselect button */}
      {selectedNotes.length > 0 && isSelectionMode && (
        <button 
          className="deselect-button"
          onClick={handleDeselect}
        >
          Deselect
        </button>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <button 
          className={`toolbar-button ${isSelectionMode ? 'active' : ''}`}
          onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            setIsMoveMode(false);
            if (!isSelectionMode) {
              setSelectedNotes([]);
            }
          }}
        >
          <span className="cursor-icon">⬚</span> Select
        </button>
        <button 
          className={`toolbar-button ${isMoveMode ? 'active' : ''}`}
          onClick={() => {
            setIsMoveMode(!isMoveMode);
            setIsSelectionMode(false);
          }}
        >
          <span className="move-icon">↔</span> Move
        </button>
        <button className={`toolbar-button ${resetViewActive ? 'active' : ''}`} onClick={handleResetView}>
          <span className="center-icon">+</span> Reset View
        </button>
        <button 
          className="toolbar-button settings-button"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
      </div>

      {/* Add the Settings Menu */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-menu">
            <h2>Settings</h2>
            <button 
              className="close-button"
              onClick={() => setShowSettings(false)}
            >
              ×
            </button>
            
            <div className="settings-option">
              <label className="settings-label">
                Show resize handles
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showResizeHandles}
                    onChange={(e) => setShowResizeHandles(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
            </div>

            <div className="settings-option">
              <label className="settings-label">
                Show side menu
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showSideMenu}
                    onChange={(e) => {
                      setShowSideMenu(e.target.checked);
                      if (!e.target.checked) {
                        setIsMenuOpen(false);
                      }
                    }}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .app {
          height: 100vh;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #1c1c1e;
          background-image: radial-gradient(circle, #2c2c2e 1px, transparent 1px);
          background-size: 20px 20px;
          color: #ffffff;
          overflow: hidden;
          position: fixed;
          width: 100%;
          top: 0;
          left: 0;
        }

        .menu-button {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1000;
          background: #2c2c2e;
          border: none;
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 20px;
          transition: background 0.3s ease;
        }

        .menu-button:hover {
          background: #3c3c3e;
        }

        .deselect-button {
          position: fixed;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          background: #2c2c2e;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          z-index: 1000;
          transition: background 0.3s ease;
        }

        .deselect-button:hover {
          background: #3c3c3e;
        }

        .side-menu {
          position: fixed;
          top: 0;
          left: -250px;
          width: 250px;
          height: 100vh;
          background: #2c2c2e;
          padding: 80px 20px 20px;
          transition: left 0.3s ease;
          z-index: 999;
          box-shadow: 2px 0 10px rgba(0,0,0,0.3);
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        .side-menu.open {
          left: 0;
        }

        .side-menu h2 {
          margin: 0 0 20px;
          font-size: 20px;
        }

        .example-note-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .example-note {
          background: #3c3c3e;
          padding: 10px;
          border-radius: 6px;
          transition: background 0.3s ease;
        }

        .example-note:hover {
          background: #4c4c4e;
        }

        .example-note-title {
          width: 100%;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
          pointer-events: none;
        }

        .example-note-text {
          width: 100%;
          height: 60px;
          background: none;
          border: none;
          color: #666666;
          font-size: 12px;
          resize: none;
          pointer-events: none;
        }

        .example-checklist {
          color: #666666;
          font-size: 12px;
        }

        .checklist-container {
          padding: 5px 0;
          overflow: hidden;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          padding: 2px 0;
          min-width: 0;
          white-space: nowrap;
        }

        .checkbox {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border: 2px solid #666;
          border-radius: 50%;
          margin-right: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: transparent;
          font-size: 13px;
          font-weight: 900;
          line-height: 1;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .checkbox:hover {
          border-color: #28cd41;
        }

        .checklist-item .checkbox.checked {
          background: #28cd41;
          border-color: #28cd41;
          color: white;
        }

        .checklist-input {
          min-width: 0;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 14px;
          padding: 2px;
        }

        .checklist-input:focus {
          outline: none;
        }

        .checklist-placeholder {
          color: #666666;
          font-size: 11px;
          cursor: text;
          padding: 2px;
        }

        .board {
          position: relative;
          height: 100vh;
          width: 100vw;
          margin: -20px;
          cursor: ${isMoveMode ? (isDraggingView ? 'grabbing' : 'grab') : 'default'};
        }

        .note {
          background: #2c2c2e;
          padding: 15px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          position: relative;
          transform-origin: center;
          transition: transform 0.1s ease, box-shadow 0.2s ease;
          user-select: none;
        }

        .note.locked {
          opacity: 0.8;
        }

        .lock-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 14px;
        }

        .note-title {
          width: 100%;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .note.dragging {
          box-shadow: 0 8px 16px rgba(0,0,0,0.5);
          opacity: 0.9;
        }

        .selection-box {
          border: 2px solid #28cd41;
          background: rgba(40, 205, 65, 0.1);
          pointer-events: none;
        }

        .note-text {
          width: 100%;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.4;
          resize: none;
          font-family: inherit;
          cursor: text;
          user-select: text;
          overflow: hidden;
          word-wrap: break-word;
        }

        .note-text.placeholder {
          color: #666666;
        }

        .note-text:focus {
          outline: none;
        }

        .resize-dots {
          position: absolute;
          right: 4px;
          bottom: 4px;
        }

        .resize-dot {
          width: 6px;
          height: 6px;
          background: #666666;
          border-radius: 50%;
          position: absolute;
          cursor: pointer;
        }

        .resize-dot.bottom {
          bottom: 0;
          right: 12px;
          cursor: ns-resize;
        }

        .resize-dot.right {
          bottom: 12px;
          right: 0;
          cursor: ew-resize;
        }

        .resize-dot.corner {
          bottom: 0;
          right: 0;
          cursor: nwse-resize;
        }

        .note-menu {
          background: #2c2c2e;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 1002;
          padding: 4px;
        }

        .note-menu button {
          display: block;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
        }

        .note-menu button:hover {
          background: #3c3c3e;
        }

        .toolbar {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: #2c2c2e;
          padding: 10px 20px;
          display: flex;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 1000;
          border-radius: 12px;
          width: auto;
        }

        .toolbar-button {
          padding: 8px 16px;
          background: #3c3c3e;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .toolbar-button:hover {
          background: #4c4c4e;
        }

        .toolbar-button.active {
          background: #28cd41;
        }

        .cursor-icon {
          font-size: 18px;
        }

        .center-icon {
          font-size: 18px;
          font-weight: bold;
        }

        .move-icon {
          font-size: 18px;
          font-weight: bold;
        }

        .checkbox {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border: 2px solid #666;
          border-radius: 50%;
          margin-right: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: transparent;
          font-size: 13px;
          font-weight: 900;
          line-height: 1;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .checkbox:hover {
          border-color: #28cd41;
        }

        .checklist-item .checkbox.checked {
          background: #28cd41;
          border-color: #28cd41;
          color: white;
        }

        .checklist-input {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 14px;
          width: 100%;
          padding: 2px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          padding: 2px 0;
        }

        .settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1100;
        }

        .settings-menu {
          background: #2c2c2e;
          padding: 20px;
          border-radius: 12px;
          min-width: 300px;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .settings-menu h2 {
          margin: 0 0 20px;
          font-size: 20px;
        }

        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.3s ease;
        }

        .close-button:hover {
          background: #3c3c3e;
        }

        .settings-button {
          color: white;
        }

        .settings-option {
          margin-bottom: 15px;
        }

        .settings-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
          padding: 10px 0;
        }

        .toggle-switch {
          position: relative;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #4c4c4e;
          transition: .4s;
          border-radius: 34px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: #28cd41;
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .color-dropdown {
          background: #2c2c2e;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          padding: 4px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 1002;
        }

        .color-option {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .color-option:hover {
          filter: brightness(1.2);
        }

        .container {
          border-radius: 8px;
          transition: border 0.3s ease;
        }
      `}</style>
    </div>
  );
}export default App;



