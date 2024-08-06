"use client";
import { useEffect, useState } from 'react';
import { Stack, Typography, Button, TextField, CssBaseline, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import EditIcon from '@mui/icons-material/Edit';
import { ThemeProvider } from '@mui/material/styles';
import { db } from './firebaseConfig'; // Ensure this path is correct
import { collection, getDocs, query, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import '../public/fonts.css';
import '../public/pixel-animation.css'; // Import the pixel animation CSS
import { darkTheme } from '../src/theme'; // Adjust the path to your theme file

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const initialPantryState = [];

export default function Home() {
  const [pantry, setPantry] = useState(initialPantryState);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [totalInventoryPrice, setTotalInventoryPrice] = useState(0);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewItem('');
    setNewPrice('');
  };

  const handleAddItem = async () => {
    if (newItem.trim() === '' || newPrice.trim() === '') return;

    try {
      const newItemData = { 
        name: newItem, 
        details: {
          count: 1,
          price: parseFloat(newPrice)
        }
      };
      const newDocRef = doc(collection(db, 'pantry'), newItem);
      await setDoc(newDocRef, newItemData);
      setPantry(prevPantry => [...prevPantry, newItemData]);
      setNewItem('');
      setNewPrice('');
      handleClose();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const handleRemoveItem = async (itemName) => {
    try {
      const itemDocRef = doc(db, 'pantry', itemName);
      await deleteDoc(itemDocRef);
      setPantry(pantry.filter(pantryItem => pantryItem.name !== itemName));
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const handleIncrement = async (itemName) => {
    try {
      const itemToUpdate = pantry.find(item => item.name === itemName);
      if (itemToUpdate && itemToUpdate.details.count < 999) {
        const newCount = itemToUpdate.details.count + 1;
        const itemDocRef = doc(db, 'pantry', itemName);
        await updateDoc(itemDocRef, { 'details.count': newCount });
        
        const updatedPantry = pantry.map(item => 
          item.name === itemName 
            ? { ...item, details: { ...item.details, count: newCount } } 
            : item
        );
        setPantry(updatedPantry);
        setTotalInventoryPrice(calculateTotalInventoryPrice());
      }
    } catch (error) {
      console.error("Error incrementing item count: ", error);
    }
  };

  const handleDecrement = async (itemName) => {
    try {
      const itemToUpdate = pantry.find(item => item.name === itemName);
      if (itemToUpdate && itemToUpdate.details.count > 1) {
        const newCount = itemToUpdate.details.count - 1;
        const itemDocRef = doc(db, 'pantry', itemName);
        await updateDoc(itemDocRef, { 'details.count': newCount });
        
        const updatedPantry = pantry.map(item => 
          item.name === itemName 
            ? { ...item, details: { ...item.details, count: newCount } } 
            : item
        );
        setPantry(updatedPantry);
        setTotalInventoryPrice(calculateTotalInventoryPrice());
      }
    } catch (error) {
      console.error("Error decrementing item count: ", error);
    }
  };

  const updateItemCountInFirestore = async (itemName, newCount) => {
    try {
      const itemDocRef = doc(db, 'pantry', itemName);
      await updateDoc(itemDocRef, { 'details.count': newCount });
    } catch (error) {
      console.error("Error updating item count: ", error);
    }
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setEditName(item.name);
  };

  const handleSaveEdit = async () => {
    if (editName.trim() === '') return;

    try {
      const itemDocRef = doc(db, 'pantry', editItem.name);
      await updateDoc(itemDocRef, { name: editName });
      setPantry(pantry.map(item => 
        item.name === editItem.name ? { ...item, name: editName } : item
      ));
      setEditItem(null);
      setEditName('');
    } catch (error) {
      console.error("Error updating item: ", error);
    }
  };

  useEffect(() => {
    const updatePantry = async () => {
      try {
        const q = query(collection(db, 'pantry'));
        const querySnapshot = await getDocs(q);
        const pantryList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            name: doc.id, 
            details: {
              count: data.details?.count || 1,
              price: data.details?.price || 0
            }
          };
        });
        setPantry(pantryList);
      } catch (error) {
        console.error("Error fetching pantry items: ", error);
      }
    };

    updatePantry();
  }, []);

  useEffect(() => {
    const createPixel = () => {
      const pixel = document.createElement('div');
      pixel.classList.add('pixel');
      pixel.style.left = `${Math.random() * 100}vw`;
      pixel.style.animationDuration = `${Math.random() * 5 + 5}s`;
      pixel.style.animationDelay = `${Math.random() * 5}s`;
      document.body.appendChild(pixel);

      setTimeout(() => {
        pixel.remove();
      }, 10000); // Remove the pixel after it has fallen
    };

    const interval = setInterval(createPixel, 100); // Create a new pixel every 100ms

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const calculateTotalInventoryPrice = () => {
    return pantry.reduce((total, item) => {
      return total + (item.details.count * item.details.price);
    }, 0);
  };

  useEffect(() => {
    setTotalInventoryPrice(calculateTotalInventoryPrice());
  }, [pantry]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ fontFamily: 'Source Code Pro, monospace' }}>
        <Box
          width="100vw"
          height="100vh"
          display="flex"
          justifyContent="center" // Center content horizontally
          alignItems="center" // Center content vertically
          flexDirection="column" // Align items in a column
          sx={{ fontFamily: 'Source Code Pro', position: 'relative', overflow: 'hidden' }} // Add padding to the top
        >
          <Box
            width="75vw"  // Adjusted to 75% of viewport width
            height="75vh" // Adjusted to 75% of viewport height
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Stack 
              width="100%" 
              height="100%" 
              spacing={2} // Spacing between items
              overflow="auto" // Enable scrolling
              alignItems="center" // Center items horizontally
            >
              <Box 
                width="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt={2} // Move header more to the top
                mb={2} // Add margin bottom to create space between header and button
              >
                <Typography 
                  variant="h4" 
                  align="center" 
                  sx={{ color: 'white', fontWeight: '300' }}
                >
                  Automotive Inventory
                </Typography>
              </Box>
              <Box 
                width="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={2} // Add margin bottom to create space between button and items
              >
                <Button 
                  variant="contained" 
                  onClick={handleOpen} 
                  sx={{ 
                    backgroundColor: 'white', 
                    color: 'black', 
                    '&:hover': {
                      backgroundColor: 'black',
                      color: 'white',
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box
                width="100%"
                height="calc(100% - 64px)" // Adjust height to account for header
                overflow="auto" // Enable scrolling
              >
                {pantry.map((item) => (
                  <Box 
                    key={item.name}
                    width="100%"
                    height="100px"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    bgcolor="#333" // Dark background color
                    p={2}
                    mb={2} // Add margin bottom to create gaps between items
                    sx={{ borderRadius: 2 }}
                  >
                    <IconButton 
                      onClick={() => handleEditItem(item)} 
                      sx={{ 
                        color: 'white', 
                        backgroundColor: 'black', 
                        '&:hover': {
                          backgroundColor: 'white',
                          color: 'black',
                        },
                        borderRadius: '50%',
                        padding: '8px'
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    {editItem && editItem.name === item.name ? (
                      <TextField 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleSaveEdit}
                        autoFocus
                        sx={{
                          flex: 1,
                          marginLeft: '8px',
                          borderRadius: 1,
                          '& .MuiInputBase-root': {
                            color: 'white',
                            backgroundColor: 'black',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                          },
                        }}
                      />
                    ) : (
                      <>
                        <Typography 
                          variant="h5" // Bigger font size
                          align="center"
                          sx={{ color: 'white', fontWeight: '300', flex: 1 }}
                        >
                          {capitalizeFirstLetter(item.name)}
                        </Typography>
                      </>
                    )}
                    <Box display="flex" alignItems="center" sx={{ flex: 1, justifyContent: 'center' }}>
                      <Button 
                        variant="contained" 
                        onClick={() => handleDecrement(item.name)} 
                        sx={{ 
                          backgroundColor: 'white', 
                          color: 'black', 
                          '&:hover': {
                            backgroundColor: 'black',
                            color: 'white',
                          },
                          minWidth: '40px',
                          marginRight: '8px'
                        }}
                      >
                        -
                      </Button>
                      <Typography 
                        variant="h6" 
                        align="center" 
                        sx={{ color: 'white', fontWeight: '300', minWidth: '40px', margin: '0 8px' }}
                      >
                        {item.details.count}
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => handleIncrement(item.name)} 
                        sx={{ 
                          backgroundColor: 'white', 
                          color: 'black', 
                          '&:hover': {
                            backgroundColor: 'black',
                            color: 'white',
                          },
                          minWidth: '40px',
                          marginLeft: '8px'
                        }}
                      >
                        +
                      </Button>
                    </Box>
                    <Button 
                      variant="contained" 
                      onClick={() => handleRemoveItem(item.name)} 
                      sx={{ 
                        backgroundColor: 'white', 
                        color: 'black', 
                        '&:hover': {
                          backgroundColor: 'black',
                          color: 'white',
                        },
                        minWidth: '80px' // Set a fixed width for the Remove button
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            </Stack>
          </Box>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={modalStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mt={2}>
                <TextField 
                  id="Item" 
                  label="Item Name" 
                  variant="outlined" 
                  fullWidth 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField 
                  id="Price" 
                  label="Price" 
                  variant="outlined" 
                  fullWidth 
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddItem} 
                  sx={{ 
                    backgroundColor: 'white', 
                    color: 'black', 
                    '&:hover': {
                      backgroundColor: 'black',
                      color: 'white',
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Modal>
          
          <Box
            width="75vw"
            height="100px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="black"
            p={2}
            mt={2}
            sx={{ borderRadius: 2 }}
          >
            <Typography variant="h5" align="center" sx={{ color: 'white', fontWeight: '300' }}>
              Total Inventory Price
            </Typography>
            <Typography variant="h4" align="center" sx={{ color: 'white', fontWeight: '300', ml: 2 }}>
              ${totalInventoryPrice.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}