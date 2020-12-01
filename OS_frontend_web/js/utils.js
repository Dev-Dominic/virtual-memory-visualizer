// Defines all storage types used within software

// Can be used to emulate basic functioality of Main and Secondary Memory
class BasicMemory {
  constructor(MemorySize) {
    // Initiallzing memory location
    this.memory = [];
    for (let i = 0; i < MemorySize; i++) {
      this.memory[i] = null;
    }
  }

  // Adds new entry into memory in specifc location
  add(content, memNumber, offset) {
    // Content should be an array of elements
    const memSize = memNumber - offset;
    if (content > memSize) return 0;

    // Copying content into memory at memNumber
    let pointer = memNumber;
    content.forEach((chunk) => {
      this.memory[pointer] = chunk;
      pointer++;
    });

    return 1;
  }

  // Used to find a specifc address and contents
  find(index) {
    return this.memory[index];
  }

  // Remove entry from specifc memory location
  remove(index) {
    if (this.memory[index]) return 0;

    this.memory[index] = null;
    return 1;
  }

  // Get Current state of memory
  getMemoryState() {
    return this.memory;
  }
}

function loadingProgram(
  MainMemory,
  mainMemorySize,
  Swap,
  TLB,
  eventList,
  programList,
  pageSize
) {
  // Loading Programs into random parts of memory
  let pageCount = 1;
  let newEventList = [...eventList];
  programList.forEach((program, index) => {
    let pageNo = Math.ceil(program.length / Number(pageSize));
    let pages = [];

    let start = 0;
    for (let i = 0; i < pageNo; i++) {
      if (MainMemory.find(mainMemorySize - 1)) {
        Swap.add([program.slice(start, start + pageSize)], pageCount);

        //  Updating Page Table
        const PageTable = {
          ...MainMemory.find(0),
          [`P${index}-${i}`]: pageCount,
        };
        MainMemory.add([PageTable], 0);

        pageCount += 1;
        start += pageSize;
      } else {
        if (i === pageNo) {
          const lastPage = MainMemory.find(pageCount - 1);
          MainMemory.add([[...lastPage, null]], pageCount - 1);
          continue;
        } else {
          MainMemory.add([program.slice(start, start + pageSize)], pageCount);
          pageCount += 1;
        }

        //  Updating Page Table
        const PageTable = {
          ...MainMemory.find(0),
          [`P${index}-${i}`]: pageCount,
        };
        MainMemory.add([PageTable], 0);
        start += pageSize;
      }

      newEventList.push({
        mainMemory: MainMemory.getMemoryState().slice(),
        tlb: TLB.getMemoryState().slice(),
        swap: Swap.getMemoryState().slice(),
      });
    }
  });

  return newEventList;
}

function FIFO(
  programList,
  executionList,
  chunkSizeMax,
  mainMemorySize,
  SwapSize,
  TLBSize,
  pageSize
) {
  if (programList.length < 2) return "Enter Bigger ProgramList";
  if (pageSize > mainMemorySize)
    return "Page Size should be larger than Main Memory Size";
  if (mainMemorySize > SwapSize)
    return "Main Memory Size should be bigger than swap size";

  // programList contains list of programs with their executing instructions
  const MainMemory = new BasicMemory(mainMemorySize); // RAM with 4Gigs
  const Swap = new BasicMemory(SwapSize); // HardDisk swap
  const TLB = new BasicMemory(TLBSize); // Translation Lookaside Buffer
  let eventList = []; // Stores list of events

  // Page Table
  MainMemory.add([{}], 0);
  eventList = loadingProgram(
    MainMemory,
    mainMemorySize,
    Swap,
    TLB,
    eventList,
    programList,
    pageSize
  );
  return eventList;
}

const programTest = [
  ["s1", "s2", "s3", "s4", "s5"],
  ["s1", "s2", "s3"],
  ["s1", "s2"],
  ["s1", "s2", "s3"],
  ["s1", "s2", "s3", "s4"],
  ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"],
  ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"],
  ["s1", "s2", "s3"],
];

const executionList = [];

//console.log(FIFO(programTest, executionList, 2, 10, 20, 5, 3));
//FIFO(programTest, executionList, 2, 10, 20, 5, 3);

//export { FIFO };
