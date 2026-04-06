import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { SearchIcon } from '../../components/Icons';

const emptyForm = {
  name: '',
  species: 'dog',
  breed: '',
  age: '',
  gender: 'Male',
  health_status: 'Healthy',
  vaccination_status: 'Vaccinated',
  up_for_adoption: 'Up for adoption',
  location_found: '',
  current_location: '',
  description: '',
  existing_image_path: '',
};

export default function ManageAnimals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchAnimals = () => {
    setLoading(true);
    API.get('/animals')
      .then((r) => setAnimals(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setForm(emptyForm);
    setImage(null);
    setEditId(null);
    setShowForm(false);
    setMsg({ text: '', ok: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', ok: true });
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    try {
      if (editId) {
        await API.put(`/animals/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg({ text: 'Animal updated successfully.', ok: true });
      } else {
        await API.post('/animals', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg({ text: 'Animal added successfully.', ok: true });
      }
      reset();
      fetchAnimals();
    } catch {
      setMsg({ text: 'Error saving animal.', ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (animal) => {
    setForm({
      name: animal.name,
      species: animal.species,
      breed: animal.breed || '',
      age: animal.age || '',
      gender: animal.gender || 'Male',
      health_status: animal.health_status || 'Healthy',
      vaccination_status: animal.vaccination_status || 'Vaccinated',
      up_for_adoption: animal.up_for_adoption || 'Up for adoption',
      location_found: animal.location_found || '',
      current_location: animal.current_location || '',
      description: animal.description || '',
      existing_image_path: animal.image_path || '',
    });
    setImage(null);
    setEditId(animal.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id) => {
    if (!confirm('Delete this animal record?')) return;
    await API.delete(`/animals/${id}`)
      .then(() => fetchAnimals())
      .catch(() => alert('Failed'));
  };

  const filtered = animals.filter(
    (animal) =>
      !search || `${animal.name} ${animal.breed} ${animal.species}`.toLowerCase().includes(search.toLowerCase())
  );

  const Field = ({ label, k, type = 'text', options, required = true, span = false }) => (
    <div className={span ? 'md:col-span-2' : ''}>
      <label className="label">{label}</label>
      {options ? (
        <select className="input" value={form[k]} onChange={set(k)}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea className="input resize-none" rows={3} value={form[k]} onChange={set(k)} />
      ) : (
        <input type={type} className="input" value={form[k]} onChange={set(k)} required={required} />
      )}
    </div>
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-forest-950 dark:text-cream-100">Manage animals</h1>
          <p className="mt-0.5 text-sm text-forest-500 dark:text-forest-400">{animals.length} animal records</p>
        </div>
        <button onClick={() => setShowForm((value) => !value)} className="btn-primary btn-sm">
          {showForm ? 'Close Form' : 'Add Animal'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="mb-5 text-lg text-forest-950 dark:text-cream-100">{editId ? 'Edit animal' : 'Add a new animal'}</h2>
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Name *" k="name" />
            <Field label="Species" k="species" options={['dog', 'cat']} />
            <Field label="Breed" k="breed" />
            <Field label="Age (years)" k="age" type="number" />
            <Field label="Gender" k="gender" options={['Male', 'Female']} />
            <Field label="Health status" k="health_status" options={['Healthy', 'Needs treatment', 'Recovering']} />
            <Field label="Vaccination" k="vaccination_status" options={['Vaccinated', 'Not vaccinated', 'Partially vaccinated']} />
            <Field label="Adoption status" k="up_for_adoption" options={['Up for adoption', 'Adopted', 'Cannot be adopted']} />
            <Field label="Location found" k="location_found" />
            <Field label="Current location" k="current_location" />

            <div className="md:col-span-2">
              <label className="label">Description or personality notes</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="Brief notes on temperament, history, or care requirements."
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Animal photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="input cursor-pointer py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-terra-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-terra-700 hover:file:bg-terra-200"
              />
              {form.existing_image_path && <p className="mt-1 text-xs text-forest-400">Current: {form.existing_image_path}</p>}
            </div>

            {msg.text && (
              <div
                className={`md:col-span-2 rounded-xl border p-3 text-sm ${
                  msg.ok
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className={`btn-primary flex-1 ${submitting ? 'opacity-70' : ''}`}>
                {submitting ? 'Saving' : editId ? 'Update Animal' : 'Add Animal'}
              </button>
              <button type="button" onClick={reset} className="btn-ghost px-6">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search animals"
              className="input py-2 pl-9 text-sm"
            />
          </div>
          <span className="text-sm text-forest-400">{filtered.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 dark:border-forest-800">
                {['Photo', 'Name', 'Species', 'Breed', 'Age', 'Status', 'Health', ''].map((heading) => (
                  <th
                    key={heading}
                    className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-forest-500 dark:text-forest-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 dark:divide-forest-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-3">
                      <div className="skeleton h-8 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : (
                filtered.map((animal) => (
                  <tr key={animal.id} className="transition-colors hover:bg-cream-50 dark:hover:bg-forest-800/50">
                    <td className="py-3 pr-4">
                      <img
                        src={animal.image_path}
                        alt={animal.name}
                        className="h-10 w-10 rounded-xl object-cover"
                        onError={(e) => {
                          e.target.src = '/uploads/placeholder.png';
                        }}
                      />
                    </td>
                    <td className="py-3 pr-4 font-medium text-forest-900 dark:text-cream-100">{animal.name}</td>
                    <td className="py-3 pr-4 capitalize text-forest-500">{animal.species}</td>
                    <td className="py-3 pr-4 text-forest-500">{animal.breed}</td>
                    <td className="py-3 pr-4 text-forest-500">{animal.age}y</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`${
                          animal.up_for_adoption === 'Up for adoption'
                            ? 'badge-green'
                            : animal.up_for_adoption === 'Adopted'
                              ? 'badge-blue'
                              : 'badge-red'
                        }`}
                      >
                        {animal.up_for_adoption}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={animal.health_status === 'Healthy' ? 'badge-green' : 'badge-amber'}>
                        {animal.health_status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(animal)} className="btn-ghost btn-sm px-3 py-1.5">
                          Edit
                        </button>
                        <button
                          onClick={() => del(animal.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
