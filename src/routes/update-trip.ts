import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function UpdateTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                destination: z.string().min(4),
                start_at: z.coerce.date(),
                end_at: z.coerce.date()
            })
        },
    }, async (request) => {
        const { tripId } = request.params;
        const { destination, start_at, end_at } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        });

        if (!trip) {
            throw new ClientError('Trip not found');
        }

        if (dayjs(start_at).isBefore(new Date())) {
            throw new ClientError('Start date must be in the future');
        }

        if (dayjs(end_at).isBefore(dayjs(start_at))) {
            throw new ClientError('End date must be after start date');
        }

        await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                destination,
                start_at,
                end_at
            }
        });

        return {
            tripId: trip.id
        }
    })
}