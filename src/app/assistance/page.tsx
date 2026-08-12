'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  sampleAssistanceOrgs,
  sampleAccessibleFacilities,
  ASSISTANCE_SERVICE_LABELS,
  FACILITY_TYPE_LABELS,
} from '@/data/sample/assistance';
import type { AssistanceService } from '@/data/sample/assistance';
import { greatCircleKm } from '@/lib/geo';
import { AccessibleIcon, PinIcon, PhoneIcon, CheckIcon, BookIcon } from '@/components/icons';

const DEFAULT_AREA = { latitude: -1.2864, longitude: 36.8172 }; // Nairobi

const ALL_SERVICES = Object.keys(ASSISTANCE_SERVICE_LABELS) as AssistanceService[];

export default function AssistancePage() {
  const [area, setArea] = useState(DEFAULT_AREA);
  const [serviceFilter, setServiceFilter] = useState<'all' | AssistanceService>('all');
  const [sortByDistance, setSortByDistance] = useState(true);

  const orgs = useMemo(() => {
    let list = sampleAssistanceOrgs;
    if (serviceFilter !== 'all') {
      list = list.filter((o) => o.services.includes(serviceFilter));
    }
    return list
      .map((o) => ({ org: o, distKm: greatCircleKm(area, o.location) }))
      .sort((a, b) => (sortByDistance ? a.distKm - b.distKm : 0));
  }, [area, serviceFilter, sortByDistance]);

  const facilities = useMemo(
    () =>
      sampleAccessibleFacilities
        .map((f) => ({ facility: f, distKm: greatCircleKm(area, f.location) }))
        .sort((a, b) => a.distKm - b.distKm),
    [area]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <AccessibleIcon className="w-14 h-14 mx-auto text-primary-600 dark:text-primary-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
            Service &amp; Assistance Animal Registry
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-3 max-w-2xl mx-auto">
            Assistance-animal organizations, accessible facilities, and your public-access rights.
            Representative sample — always verify with each organization directly.
          </p>
        </motion.div>

        {/* Your area */}
        <div className="max-w-xl mx-auto mb-10 bg-white dark:bg-secondary-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-2 flex items-center gap-1.5">
            <PinIcon className="w-3.5 h-3.5" /> Your area (distances computed from here)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
              Latitude
              <input
                type="number" step="0.0001" value={area.latitude}
                onChange={(e) => setArea({ ...area, latitude: parseFloat(e.target.value) || 0 })}
                className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm w-full"
              />
            </label>
            <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
              Longitude
              <input
                type="number" step="0.0001" value={area.longitude}
                onChange={(e) => setArea({ ...area, longitude: parseFloat(e.target.value) || 0 })}
                className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm w-full"
              />
            </label>
          </div>
        </div>

        {/* Organizations */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">Assistance-Animal Organizations</h2>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <label className="text-xs text-secondary-500 dark:text-secondary-400">Service</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as typeof serviceFilter)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All services</option>
              {ALL_SERVICES.map((s) => (
                <option key={s} value={s}>{ASSISTANCE_SERVICE_LABELS[s]}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
              <input
                type="checkbox"
                checked={sortByDistance}
                onChange={(e) => setSortByDistance(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              Sort by distance
            </label>
            <span className="ml-auto text-sm text-secondary-500 dark:text-secondary-400">
              {orgs.length} organization{orgs.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map(({ org, distKm }) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-secondary-900 dark:text-white leading-snug">{org.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium shrink-0">
                    {distKm < 5 ? 'in your area' : `~${Math.round(distKm)} km`}
                  </span>
                </div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">{org.city}, {org.country}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {org.services.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 text-[11px] font-medium">
                      {ASSISTANCE_SERVICE_LABELS[s]}
                    </span>
                  ))}
                </div>
                {org.accreditation && (
                  <div className="text-[11px] text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/20 rounded-lg px-2 py-1 mb-2 flex items-center gap-1">
                    <CheckIcon className="w-3 h-3 shrink-0" /> {org.accreditation}
                  </div>
                )}
                {org.note && <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-3">{org.note}</p>}
                <div className="mt-auto pt-3 flex items-center gap-3 text-sm">
                  <a
                    href={org.website}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
                  >
                    <BookIcon className="w-4 h-4" /> Website
                  </a>
                  <span className="text-secondary-500 dark:text-secondary-400 flex items-center gap-1.5">
                    <PhoneIcon className="w-4 h-4 text-primary-500" /> {org.phone}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Accessible facilities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">Accessible Facilities Near You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map(({ facility, distKm }) => (
              <div key={facility.id} className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-secondary-900 dark:text-white leading-snug">{facility.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-500 font-medium shrink-0">
                    {distKm < 5 ? 'in your area' : `~${Math.round(distKm)} km`}
                  </span>
                </div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">
                  {FACILITY_TYPE_LABELS[facility.type]} · {facility.city}, {facility.country}
                </p>
                <ul className="space-y-1.5 mb-3">
                  {facility.features.map((f) => (
                    <li key={f} className="text-xs text-secondary-600 dark:text-secondary-300 flex items-start gap-1.5">
                      <CheckIcon className="w-3.5 h-3.5 text-success-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="text-sm text-secondary-500 dark:text-secondary-400 flex items-center gap-1.5">
                  <PhoneIcon className="w-4 h-4 text-primary-500" /> {facility.phone}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Know your rights */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
            <BookIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" /> Know Your Rights
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">What is a service animal?</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-3">
                Under the US <a className="text-primary-600 dark:text-primary-400 hover:underline" href="https://www.ada.gov" target="_blank" rel="noopener noreferrer">Americans with Disabilities Act</a>,
                a service animal is a <strong>dog</strong> (or miniature horse where reasonable) individually{' '}
                <strong>trained to perform tasks</strong> for a person with a disability — guiding, alerting to
                sounds or medical events, retrieving items, pulling a wheelchair, or interrupting psychiatric episodes.
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                Emotional support animals, comfort animals, and therapy animals are{' '}
                <strong>not service animals</strong> under the ADA: they provide comfort but are not trained to
                perform a specific task, and they do not have public-access rights in businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">What businesses may ask</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-3">
                Staff may ask only two questions: <em>(1)</em> Is the dog a service animal required because of a
                disability? <em>(2)</em> What work or task has it been trained to perform? They may{' '}
                <strong>not</strong> ask about the disability, require documentation or certification, or charge a
                fee for the animal.
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                The animal must be under control (harnessed, leashed, or tethered unless that interferes with its
                task) and housebroken. Rules differ outside the US — Kenya&apos;s Persons with Disabilities Act and
                India&apos;s Rights of Persons with Disabilities Act provide disability protections, but public-access
                rights for service animals vary; check locally.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
