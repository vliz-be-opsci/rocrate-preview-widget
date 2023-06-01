library("devtools")
library(dada2)
packageVersion("dada2")

############  config  #############
path <- "S:\\datac\\Projects\\OSD_S2S\\raw_data\\" # CHANGE ME to the directory containing the fastq files after unzipping.
analysis <- "16S" #18S 16S or LTS (no support for LTS)

paste("_",analysis,"_raw_R1.fastq",sep="")


list.files(path)
split_path <- function(x) if (dirname(x)==x) x else c(basename(x),split_path(dirname(x)))
# Forward and reverse fastq filenames have format: SAMPLENAME_01.fastq and SAMPLENAME_02.fastq
fnFs <- sort(list.files(path, pattern=paste("_",analysis,"_raw_R1.fastq",sep=""), full.names = TRUE))
fnRs <- sort(list.files(path, pattern=paste("_",analysis,"_raw_R2.fastq",sep=""), full.names = TRUE))
# Extract sample names, assuming filenames have format: SAMPLENAME_XXX.fastq
sample.names <- sapply(strsplit(basename(fnFs), "_"), `[`, c(1:4))
sample.names <- c()
for (fileses in fnFs){
  inter <- split_path(fileses)
  print(inter[1])
  newname <- strsplit(inter[1],paste("_",analysis,"_raw_R1.fastq",sep=""))
  endname <- newname[[1]]
  print(endname)
  sample.names = c(sample.names, endname)
}

#make function 
createdata <- function(stationame) {
  if (grepl(stationame, ".fastq") == FALSE) {
    totestFs <- paste("S:\\datac\\Projects\\OSD_S2S\\raw_data\\",stationame,"_",analysis,"_raw_R1.fastq",sep ="")
    totestRs <- paste("S:\\datac\\Projects\\OSD_S2S\\raw_data\\",stationame,"_",analysis,"_raw_R2.fastq",sep ="")
    
    #plot the quality
    #put plots in seperate filefolder
    
    # Place filtered files in filtered/ subdirectory
    filtFs <- file.path(path, "filtered", paste0(sample.names, "_F_filt.fastq.gz"))
    filtRs <- file.path(path, "filtered", paste0(sample.names, "_R_filt.fastq.gz"))
    names(filtFs) <- sample.names
    names(filtRs) <- sample.names
    
    out <- filterAndTrim(fnFs, filtFs, fnRs, filtRs, truncLen=c(240,150),
                         maxN=0, maxEE=c(2,8), truncQ=2, rm.phix=TRUE,
                         compress=TRUE, multithread=TRUE) # On Windows set multithread=FALSE
    head(out)
    
    #look at errorrates. method learns this error model from the data, 
    #by alternating estimation of the error rates and inference of sample composition until 
    #they converge on a jointly consistent solution. As in many machine-learning problems, 
    #the algorithm must begin with an initial guess, for which the maximum possible error rates 
    #in this data are used (the error rates if only the most abundant sequence is correct and all the rest are errors).
     
    
  }
}

createmergedfiles <- function(stationame) {
  errF <- learnErrors(filtFs, multithread=TRUE) 
  errR <- learnErrors(filtRs, multithread=TRUE)
  
  plotErrors(errR, nominalQ=TRUE)
  names(filtFs) <- sample.names
  names(filtRs) <- sample.names
  #apply the core sample inference algorithm to the filtered and trimmed sequence data.
  dadaFs <- tryCatch(dada(filtFs, err=errF, multithread=TRUE))  
  dadaRs <- tryCatch(dada(filtRs, err=errR, multithread=TRUE))   
  
  mergers <-  tryCatch(mergePairs(dadaFs, filtFs, dadaRs, filtRs, verbose=TRUE))  
  # Inspect the merger data.frame from the first sample
  head(mergers[[1]])
  
  #We can now construct an amplicon sequence variant table (ASV) table,
  #a higher-resolution version of the OTU table produced by traditional methods.
  seqtab <- makeSequenceTable(mergers)
  dim(seqtab)
  # Inspect distribution of sequence lengths
  table(nchar(getSequences(seqtab)))
  
  #remove chimeras  Chimeric sequences are identified
  #if they can be exactly reconstructed by combining a left-segment 
  #and a right-segment from two more abundant "parent" sequences.
  seqtab.nochim <- removeBimeraDenovo(seqtab, method="consensus", multithread=TRUE, verbose=TRUE)
  dim(seqtab.nochim)
  sum(seqtab.nochim)/sum(seqtab)
  
  #final check of progress
  #getN <- function(x) sum(getUniques(x))
  #track <- cbind(out, sapply(dadaFs, getN), sapply(dadaRs, getN), sapply(mergers, getN), rowSums(seqtab.nochim))
  # If processing a single sample, remove the sapply calls: e.g. replace sapply(dadaFs, getN) with getN(dadaFs)
  #colnames(track) <- c("input", "filtered", "denoisedF", "denoisedR", "merged", "nonchim")
  #rownames(track) <- sample.names
  #head(track)
  
  #assign taxa to the sequences
  taxa <- assignTaxonomy(seqtab.nochim, "C:\\Users\\cedricd\\Documents\\OSD\\silva_nr_v132_train_set.fa.gz", multithread=TRUE)
  #print taxa found
  taxa.print <- taxa # Removing sequence rownames for display only
  rownames(taxa.print) <- NULL
  head(taxa.print)
  write.table(taxa.print, paste("S:\\datac\\Projects\\OSD_S2S\\species_files\\",stationame,"_",tobesure,".txt", sep=""), sep=";")
  tobesure <- tobesure +1
}
#make a subset of the fnFs and fnRs for each station based on the sample.names
tobesure <- 1
lapply(sample.names, createdata)

#next check on merging files that did have a filtered file
path <- "S:\\datac\\Projects\\OSD_S2S\\raw_data\\filtered\\"
fnFs <- sort(list.files(path, pattern=paste("_F_filt.fastq",sep=""), full.names = TRUE))
fnRs <- sort(list.files(path, pattern=paste("_R_filt.fastq",sep=""), full.names = TRUE))
# Extract sample names, assuming filenames have format: SAMPLENAME_XXX.fastq
sample.names <- sapply(strsplit(basename(fnFs), "_"), `[`, c(1:4))
sample.names <- c()
for (fileses in fnFs){
  inter <- split_path(fileses)
  #print(inter[1])
  newname <- strsplit(inter[1],paste("_F_filt.fastq.gz",sep=""))
  endname <- newname[[1]]
  print(endname)
  sample.names = c(sample.names, endname)
}
filtFs <- file.path( paste(path,sample.names, "_F_filt.fastq.gz", sep = ""))
filtRs <- file.path( paste(path,sample.names, "_R_filt.fastq.gz", sep = ""))
lapply(sample.names, createmergedfiles)
