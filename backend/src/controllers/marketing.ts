
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

const TESTIMONIALS = [
    {
        id: "1",
        name: "Budi Santoso",
        role: "Warehouse Manager",
        content: "Lumbung telah mengubah cara kami mengelola stok. Efisiensi meningkat 200% dalam bulan pertama.",
        avatar: "BS",
    },
    {
        id: "2",
        name: "Sarah Wijaya",
        role: "Business Owner",
        content: "Sistem yang sangat intuitif dan mudah digunakan. Laporan keuangannya sangat membantu pengambilan keputusan.",
        avatar: "SW",
    },
    {
        id: "3",
        name: "Anton Prasetyo",
        role: "Logistics Head",
        content: "Fitur barcode scanning-nya sangat cepat dan akurat. Mengurangi human error secara signifikan.",
        avatar: "AP",
    },
    {
        id: "4",
        name: "Michael Chen",
        role: "Supply Chain Director",
        content: "Inventory accuracy improved by 99% within the first month. Incredible tool.",
        avatar: "MC",
    },
    {
        id: "5",
        name: "Jessica Fox",
        role: "Logistics Manager",
        content: "The best warehouse management system we have used in years.",
        avatar: "JF",
    },
    {
        id: "6",
        name: "Rina Kartika",
        role: "Operational Manager",
        content: "Sangat membantu dalam tracking expired date barang. Highly recommended!",
        avatar: "RK",
    },
    {
        id: "7",
        name: "David Tan",
        role: "Retail Owner",
        content: "Integrasi dengan POS sangat mulus. Stok selalu sinkron real-time.",
        avatar: "DT",
    },
    {
        id: "8",
        name: "Amanda Lee",
        role: "Procurement Lead",
        content: "Fitur purchase order otomatis sangat menghemat waktu tim kami.",
        avatar: "AL",
    },
    {
        id: "9",
        name: "Reza Pratama",
        role: "IT Manager",
        content: "API-nya sangat well-documented dan mudah diintegrasikan dengan sistem internal kami.",
        avatar: "RP",
    },
    {
        id: "10",
        name: "Siti Nurhaliza",
        role: "Small Business Owner",
        content: "Harga sangat terjangkau untuk fitur selengkap ini. Support timnya juga ramah.",
        avatar: "SN",
    },
];

export async function getTestimonialsHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        // In the future, this can query a database table
        return reply.send(TESTIMONIALS);
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch testimonials' });
    }
}

export async function getPlansHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const plans = await prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { priceMonthly: 'asc' }
        });
        return reply.send(plans);
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch plans' });
    }
}
