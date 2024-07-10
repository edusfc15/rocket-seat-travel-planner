import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { array, z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";



export async function getActivities(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        },
    }, async (request, reply) => {
        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }, include
                : {
                activities: {
                    orderBy: {
                        occurs_at: 'asc'
                    }
                }
            }
        });

        const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.end_at).diff(dayjs(trip.start_at), 'days');

        const activities = Array.from(
            {
                length: differenceInDaysBetweenTripStartAndEnd + 1
            }
        ).map((_, index) => {
            const date = dayjs(trip.start_at).add(index, 'days')

            return {
                date: date.toDate(),
                activities: trip.activities.filter(activity => dayjs(activity.occurs_at).isSame(date, 'day'))
            }

        })

        if (!trip) {
            throw new Error('Trip not found');
        }


        return activities;



    })
}