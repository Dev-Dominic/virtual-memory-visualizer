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
    if (!this.memory[index]) return 0;

    const page = this.memory[index];
    this.memory[index] = null;
    return page;
  }

  // Get Current state of memory
  getMemoryState() {
    return this.memory;
  }
}

function loadingProgram({
  MainMemory,
  mainMemorySize,
  Swap,
  TLB,
  pageCache,
  eventList,
  programList,
  pageSize,
}) {
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
        MainMemory.add([program.slice(start, start + pageSize)], pageCount);

        //  Updating Page Table
        const PageTable = {
          ...MainMemory.find(0),
          [`P${index}-${i}`]: pageCount,
        };
        MainMemory.add([PageTable], 0);
        start += pageSize;
        pageCount += 1;
      }

      newEventList.push({
        mainMemory: MainMemory.getMemoryState().slice(),
        tlb: TLB.getMemoryState().slice(),
        swap: Swap.getMemoryState().slice(),
        pageCache: pageCache.getMemoryState().slice(),
      });
    }
  });

  return newEventList;
}

function FIFO(
  programList,
  executionList,
  mainMemorySize,
  SwapSize,
  TLBSize,
  pageCacheSize,
  pageSize
) {
  if (programList.length < 2) return "Enter Bigger ProgramList";
  if (pageSize > mainMemorySize)
    return "Main Memory Size should be larger than Page Size";
  if (mainMemorySize > SwapSize)
    return "Swap Size should be bigger than mainMemory size";

  // programList contains list of programs with their executing instructions
  const MainMemory = new BasicMemory(mainMemorySize + 1); // RAM with 4Gigs
  const Swap = new BasicMemory(SwapSize); // HardDisk swap
  const TLB = new BasicMemory(TLBSize); // Translation Lookaside Buffer
  const pageCache = new BasicMemory(pageCacheSize + 1);
  let pageCachePointer = 1;
  let TLBPointer = 0;
  let queuePointer = 1;
  let eventList = []; // Stores list of events

  // Page Table
  MainMemory.add([{}], 0);
  pageCache.add([[]], 0);
  eventList.push({
    mainMemory: MainMemory.getMemoryState().slice(),
    tlb: TLB.getMemoryState().slice(),
    swap: Swap.getMemoryState().slice(),
    pageCache: pageCache.getMemoryState().slice(),
  });

  eventList = loadingProgram({
    MainMemory,
    mainMemorySize: mainMemorySize + 1,
    Swap,
    pageCache,
    TLB,
    eventList,
    programList,
    pageSize,
  });

  // Simulating CPU fetching for page
  executionList.forEach((execute) => {
    // Checking pageCache for given page
    if (pageCache.find(0).includes(execute)) {
      console.log(`${execute} Present in Page Cache`);
      return;
    }

    const memLocation = MainMemory.find(0)[execute];

    // Removing page from Main Memory
    let page = MainMemory.find(memLocation);

    // Checking swap
    if (!page) {
      page = Swap.find(memLocation);
      if (!page) return;

      //  Updating Page Table
      let PageTable = MainMemory.find(0);
      const pageAssoc = Object.keys(PageTable).filter(
        (key) => PageTable[key] === queuePointer
      )[0];
      PageTable = {
        ...MainMemory.find(0),
        [execute]: queuePointer,
        [pageAssoc]: memLocation,
      };
      MainMemory.add([PageTable], 0);

      eventList.push({
        mainMemory: MainMemory.getMemoryState().slice(),
        tlb: TLB.getMemoryState().slice(),
        swap: Swap.getMemoryState().slice(),
        pageCache: pageCache.getMemoryState().slice(),
      });

      let replace = MainMemory.remove(queuePointer);
      Swap.add([replace], memLocation);
      MainMemory.add([page], queuePointer);

      eventList.push({
        mainMemory: MainMemory.getMemoryState().slice(),
        tlb: TLB.getMemoryState().slice(),
        swap: Swap.getMemoryState().slice(),
        pageCache: pageCache.getMemoryState().slice(),
      });

      queuePointer = queuePointer >= mainMemorySize ? 1 : queuePointer + 1;
    }

    eventList.push({
      mainMemory: MainMemory.getMemoryState().slice(),
      tlb: TLB.getMemoryState().slice(),
      swap: Swap.getMemoryState().slice(),
      pageCache: pageCache.getMemoryState().slice(),
    });

    // Adding page to Page Cache
    pageCache.add([page], pageCachePointer);
    let addresses = [...pageCache.find(0)];
    addresses[pageCachePointer - 1] = execute;
    pageCache.add([addresses], 0);

    pageCachePointer =
      pageCachePointer + 1 >= pageCacheSize + 1 ? 1 : pageCachePointer + 1;

    eventList.push({
      mainMemory: MainMemory.getMemoryState().slice(),
      tlb: TLB.getMemoryState().slice(),
      swap: Swap.getMemoryState().slice(),
      pageCache: pageCache.getMemoryState().slice(),
    });

    // Adding Page Frame Location to TLB
    TLB.add([{ pageNumber: execute, frameNumber: memLocation }], TLBPointer);
    eventList.push({
      mainMemory: MainMemory.getMemoryState().slice(),
      tlb: TLB.getMemoryState().slice(),
      swap: Swap.getMemoryState().slice(),
      pageCache: pageCache.getMemoryState().slice(),
    });
    TLBPointer = TLBPointer >= TLBSize - 1 ? 0 : TLBPointer + 1;

    console.log(`Getting: ${execute}`);

    console.log("Main Memory");
    console.log(MainMemory.getMemoryState());

    console.log("Page Cache");
    console.log(pageCache.getMemoryState());

    console.log("TLB");
    console.log(TLB.getMemoryState());
  });

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

const executionList = [
  "P6-0",
  "P6-1",
  "P0-1",
  "P0-0",
  "P7-14",
  "P2-0",
  "P0-0",
  "P2-0",
  "P2-0",
  "P2-0",
  "P6-0",
  "P7-0",
  "P0-0",
  "P0-0",
  "P4-0",
  "P2-0",
  "P4-0",
  "P2-0",
  "P7-0",
  "P5-0",
  "P6-0",
];

//console.log(FIFO(programTest, executionList, 5, 20, 5, 3, 3));
FIFO(programTest, executionList, 5, 20, 5, 3, 3);
