# sequencer


## Pattern Format

- pattern
  - bars[]
    - bar
      - sequences[]
        - array of steps
          - step             
          - length           (calculated by sequencer)
          - action
            - name
            - options
              - {anything - depends on the action's requirements}

## Pattern Format for Sequence Messenger 
### (thing that sends commands out to devices per sequence)

The pattern format should be interpreted into a control format, which flattens the parallel sequences into 'frames' based on starting step. For excample, 4 bar patterns of 16 steps would compile into 64 frames.

## Compiled Sequence

- sequence
  - frames[]
    - frame
      - channelId
        - action
