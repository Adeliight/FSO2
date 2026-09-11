import { useState, useEffect } from "react";
import axios from "axios";

const baseUrl = "http://localhost:3001/persons";

const getAll = () => {
  const request = axios.get(baseUrl);
  const nonExisting = {
    id: 10000,
    name: "Phonenumber was not saved to the server",  
    number: "000-000000",
  };
  return request.then((response) => response.data.concat(nonExisting));
};

const create = (newObject) =>
  axios.post(baseUrl, newObject).then((res) => res.data);
const update = (id, newObject) =>
  axios.put(`${baseUrl}/${id}`, newObject).then((res) => res.data);
const remove = (id) => axios.delete(`${baseUrl}/${id}`);

const Notification = ({ message, type }) => {
  if (message === null) return null;
  return <div className={`notification ${type}`}>{message}</div>;
};

const Filter = ({ filter, handleFilterChange }) => (
  <div>
    filter: <input value={filter} onChange={handleFilterChange} />
  </div>
);

const PersonForm = ({
  onSubmit,
  newName,
  handleNameChange,
  newNumber,
  handleNumberChange,
}) => (
  <form onSubmit={onSubmit}>
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    <div>
      number: <input value={newNumber} onChange={handleNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
);

const Person = ({ person, handleDelete }) => (
  <div>
    {person.name} {person.number}{" "}
    <button onClick={() => handleDelete(person.id, person.name)}>delete</button>
  </div>
);

const Persons = ({ persons, handleDelete }) => (
  <div>
    {persons.map((person) => (
      <Person key={person.id} person={person} handleDelete={handleDelete} />
    ))}
  </div>
);

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const showNotification = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const addPerson = (event) => {
    event.preventDefault();

    const existingPerson = persons.find(
      (p) => p.name.toLowerCase() === newName.trim().toLowerCase(),
    );

    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already added to phonebook. Replace the old number with a new one?`,
        )
      ) {

        const updatedPerson = { ...existingPerson, number: newNumber };

        update(existingPerson.id, updatedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((p) =>
                p.id !== existingPerson.id ? p : returnedPerson,
              ),
            );
            setNewName("");
            setNewNumber("");
            showNotification(`Updated number for ${returnedPerson.name}`);
          })
          .catch((error) => {
            showNotification(
              `Information of ${existingPerson.name} has already been removed from server`,
              "error",
            );
            setPersons(persons.filter((p) => p.id !== existingPerson.id));
          });
      }
      return;
    }

    const personObject = {
      name: newName,
      number: newNumber,
    };

    create(personObject)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setNewName("");
        setNewNumber("");
        showNotification(`Added ${returnedPerson.name}`);
      })
      .catch((error) => {
        showNotification("Failed to add person to the server", "error");
      });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      remove(id)
        .then(() => {
          setPersons(persons.filter((p) => p.id !== id));
          showNotification(`Deleted ${name}`);
        })
        .catch((error) => {
          showNotification(
            `Information of ${name} has already been removed from server`,
            "error",
          );
          setPersons(persons.filter((p) => p.id !== id));
        });
    }
  };

  const personsToShow =
    filter === ""
      ? persons
      : persons.filter((p) =>
          p.name.toLowerCase().includes(filter.toLowerCase()),
        );

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={message} type={messageType} />

      <Filter
        filter={filter}
        handleFilterChange={(e) => setFilter(e.target.value)}
      />

      <h3>Add a new</h3>

      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        handleNameChange={(e) => setNewName(e.target.value)}
        newNumber={newNumber}
        handleNumberChange={(e) => setNewNumber(e.target.value)}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
