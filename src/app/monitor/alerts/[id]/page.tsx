import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sampleAlerts } from '@/data/sample/alerts';
import AlertDetailClient from './AlertDetailClient';

export async function generateStaticParams() {
  return sampleAlerts.map((alert) => ({
    id: alert.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const alert = sampleAlerts.find((a) => a.id === id);
  return {
    title: alert ? `Alert: ${alert.animal.commonName} | OpenAnimalNet` : 'Alert | OpenAnimalNet',
    description: alert ? `${alert.type.toUpperCase()} alert — ${alert.message}` : 'Monitoring alert detail.',
  };
}

export default async function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = sampleAlerts.find((a) => a.id === id);
  if (!alert) {
    notFound();
  }
  return <AlertDetailClient alert={alert} />;
}