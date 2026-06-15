class PathFindingService {
    
    constructor(scheduledRoutes) {
        this.scheduledRoutes = scheduledRoutes;
    }

    findTopTrips(departureStation, arrivalStation, departureAfter, dim = 5) { // limit to 5 top trips
        const results = []; // the result is a list of trips
        const queue = []; // temp

        const startId = departureStation._id.toString();
        const endId = arrivalStation._id.toString();

        queue.push({
            stationId: startId,
            currentTime: new Date(departureAfter), //when do i what to take the first train
            trips: [],
            changes: 0,
            totalCost: 0,
            visitedStations: new Set([startId]), //we need to track visited stations to prevent to loop back with the train
            //so we add departure Station to the list
        });

        while (queue.length && results.length < dim) {
            queue.sort((a, b) => a.currentTime - b.currentTime); // way to sort is based on time
            const current = queue.shift();

            if (current.stationId === endId) {
                results.push(this._buildLongTrip(current.trips));
                continue;
            }

            for (const sr of this.scheduledRoutes) {
                const route = sr.route;
                if (!route) continue;

                if (route.departureStation._id.toString() !== current.stationId) continue;

                const dep = sr.getEffectiveDepartureTime?.() || new Date(sr.departureTime);
                const arr = sr.getEffectiveArrivalTime?.() || new Date(sr.arrivalTime);

                if (dep < current.currentTime) continue; // look for other routes, we would not make it in time

                const nextId = route.arrivalStation._id.toString();

                //skip stations already visited in this path to prevent infinite loops
                if (current.visitedStations.has(nextId)) continue;

                const nextVisited = new Set(current.visitedStations);
                nextVisited.add(nextId);

                queue.push({
                    stationId: nextId,
                    currentTime: arr,
                    trips: [...current.trips, { scheduledRoute: sr }],
                    changes: current.changes + 1,
                    totalCost: current.totalCost + (sr.ticketPrice || 0),
                    visitedStations: nextVisited,
                });
            }
        }

        return results;
    }

    _buildLongTrip(trips) {
        return {
            trips,
            totalPrice: trips.reduce((s, t) => s + (t.scheduledRoute.ticketPrice || 0), 0),
            numberOfChanges: Math.max(0, trips.length - 1),
        };
    }
}

module.exports = PathFindingService;
