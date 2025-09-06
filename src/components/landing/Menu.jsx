import React from 'react';

const Menu = ({ selected, setSelected }) => {
  const menuItems = ['Todos', 'Posiciones', 'Goleadores', 'Tarjetas', 'Partidos', 'Equipos'];

  return (
    <div className="mb-8">
      <div className="flex justify-center space-x-4">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => setSelected(item)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              selected === item
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Menu;