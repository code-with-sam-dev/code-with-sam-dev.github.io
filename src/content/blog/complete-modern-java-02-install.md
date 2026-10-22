---
title: 'Install Java 25 and IntelliJ IDEA on a Mac (Complete Beginner)'
description: 'Episode 2 of Complete Modern Java. A fresh IntelliJ IDEA, Java 25 downloaded from inside it, the grocery receipt program typed and run, and then the part most setups get wrong: the terminal still finds an old Java. Why that happens, how to fix it for one window, and how to run the program without an IDE.'
pubDate: 2026-10-21
cover: '/covers/complete-modern-java-02-install.jpg'
sheet: '/downloads/complete-modern-java-02-install.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'beginners', 'intellij']
series: 'Complete Modern Java'
episode: 2
duration: '7:00'
draft: false
youtube: 'IQ5hSXXnaEo'
---

On this Mac, the terminal answers `java -version` with Java 11, from 2022. Java is
installed, but the wrong one answers. That is the most common way a beginner's
setup goes wrong, and this episode fixes it for real.

## What we install

Two things. The **JDK**, the Java Development Kit: the compiler, `javac`, and the
runtime that runs your program. And an **IDE**: IntelliJ IDEA. At the time of
recording IntelliJ IDEA is one download, and its core Java features are free with
no sign in.

## Java 25 from inside IntelliJ

New Project, name `GroceryReceipt`, build system IntelliJ, and untick "Add sample
code". Then the JDK list: IntelliJ shows any Java already on the computer, and
suggests the newest. We choose **Download JDK**, version **25** (the long term
support release this course uses), vendor **Eclipse Temurin**, a free and open
source build. Note the location it shows: that is where Java lives on your Mac.

## Write it and run it

Right click `src`, New, **Java Compact File**, name it `GroceryReceipt`, and type
the program from Episode 1. The green arrow beside `void main()` runs it:

```text
Sarah's groceries
Items: 3
Total: $3.99

Process finished with exit code 0
```

The last line is IntelliJ: exit code 0 means the program ended without an error.

## The terminal still says Java 11

Installing a JDK does not change which Java your terminal finds. The terminal
searches a list of folders, the **path**, and runs the first `java` it finds:

```sh
java -version     # openjdk version "11.0.14.1" 2022-02-08 LTS
type -a java      # java is /usr/bin/java
export JAVA_HOME=$HOME/Library/Java/JavaVirtualMachines/temurin-25.0.4.1/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
java -version     # openjdk version "25.0.4.1" 2026-08-18 LTS
java src/GroceryReceipt.java
```

That fix lasts for one terminal window only. Making it permanent comes later in
the course. The last command runs the program straight from source, no IDE needed.

## Two separate checks

Which Java does my project use? **Project Structure**, next to SDK. Which Java does
my terminal use? Ask the terminal. When something runs in IntelliJ but fails in the
terminal, this is usually why.

Using Windows? It gets its own episode. The steps are in the repository README, and
the one page sheet is linked at the top of this page.
