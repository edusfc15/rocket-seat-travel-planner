import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function createActivities(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                title: z.string().min(4),
                occurs_at: z.coerce.date()
            })
        },
    }, async (request, reply) => {
        const { tripId } = request.params;
        const { title, occurs_at } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        });

        if (!trip) {
            throw new ClientError('Trip not found');
        }

        if (dayjs(occurs_at).isBefore(dayjs(trip.start_at)) || dayjs(occurs_at).isAfter(dayjs(trip.end_at))) {
            console.log('what?');
            
            throw new ClientError('Activity date must be within the trip dates');
        }

        const activity = await prisma.activity.create({
            data: {
            title,
            occurs_at,
            trip_id: tripId
            }
        });

         return { activityId: activity.id}
    })
}