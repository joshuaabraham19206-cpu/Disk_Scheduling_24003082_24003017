#ifndef SCHEDULER_H
#define SCHEDULER_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define MAX_STEPS 2048

typedef struct {
    int from;
    int to;
    int distance;
    int cumulative_distance;
    int is_wraparound;
    char reason[256];
} StepDetail;

typedef struct {
    char algorithm[32];
    int initial_head;
    int direction; // 1 for HIGH/UP, -1 for LOW/DOWN
    int max_tracks;
    int scan_boundary;
    int count_wraparound;
    int sequence_count;
    int sequence[MAX_STEPS];
    int step_count;
    StepDetail steps[MAX_STEPS];
    int total_movement;
    double average_movement;
} SimulationResult;

void init_result(SimulationResult *res, const char *algo, int initial_head, int direction, int max_tracks, int scan_boundary, int count_wraparound);
void add_step(SimulationResult *res, int from, int to, int is_wraparound, const char *reason);
void print_result_json(const SimulationResult *res);

void run_fcfs(const int *requests, int num_requests, int initial_head, SimulationResult *res);
void run_sstf(const int *requests, int num_requests, int initial_head, SimulationResult *res);
void run_scan(const int *requests, int num_requests, int initial_head, int direction, int max_tracks, int scan_boundary, SimulationResult *res);
void run_cscan(const int *requests, int num_requests, int initial_head, int direction, int max_tracks, int count_wraparound, SimulationResult *res);
void run_look(const int *requests, int num_requests, int initial_head, int direction, SimulationResult *res);
void run_clook(const int *requests, int num_requests, int initial_head, int direction, int count_wraparound, SimulationResult *res);

#endif // SCHEDULER_H
