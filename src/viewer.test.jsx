import fs from "fs";
import path from "path";

import { mount } from "enzyme";
import * as React from "react";

import filesToParts from "./io/filesToParts";
import { SeqViz } from "./viewer";
import SeqViewer from "./SeqViz/SeqViewer";

const defaultProps = {
  name: "test_part",
  seq: "ATGGTAGTTAGATAGGGATACCGAT",
  annotations: [
    {
      name: "ann_1",
      start: 0,
      end: 10
    }
  ],
  style: { height: 200, width: 400 },
  size: { height: 200, width: 400 }
};

describe("SeqViz rendering (React)", () => {
  it("renders with manual part meta", () => {
    const wrapper = mount(<SeqViz {...defaultProps} />);

    // renders both a circular and linear viewer by default
    expect(wrapper.find(SeqViewer)).toHaveLength(2);
    expect(wrapper.find(".la-vz-linear-scroller")).toHaveLength(1);
    expect(wrapper.find(".la-vz-circular-viewer")).toHaveLength(1);
    const firstViewer = wrapper.find(SeqViewer).first();
    expect(firstViewer.find(".la-vz-linear-scroller").length).toBeFalsy();
    expect(firstViewer.find(".la-vz-circular-viewer").length).toBeTruthy();
    // renders bp for the sequence (only works for smaller seqs
    // where the infinite scroll doesn't truncate)
    expect(wrapper.find("text").length).toBeGreaterThanOrEqual(defaultProps.seq.length * 2);
  });

  it("renders with linear viewer only", async () => {
    const wrapper = mount(<SeqViz {...defaultProps} viewer="linear" />);

    expect(wrapper.find(SeqViewer)).toHaveLength(1);
    expect(wrapper.find(".la-vz-linear-scroller")).toHaveLength(1);
    expect(wrapper.find(".la-vz-circular-viewer")).toHaveLength(0);
  });

  it("renders with circular viewer only", () => {
    const wrapper = mount(<SeqViz {...defaultProps} viewer="circular" />);

    expect(wrapper.find(SeqViewer)).toHaveLength(1);
    expect(wrapper.find(".la-vz-linear-scroller")).toHaveLength(0);
    expect(wrapper.find(".la-vz-circular-viewer")).toHaveLength(1);
  });

  it("renders with both viewers flipped", () => {
    const wrapper = mount(<SeqViz {...defaultProps} viewer="both_flip" />);

    expect(wrapper.find(SeqViewer)).toHaveLength(2);
    expect(wrapper.find(".la-vz-linear-scroller")).toHaveLength(1);
    expect(wrapper.find(".la-vz-circular-viewer")).toHaveLength(1);
    const firstViewer = wrapper.find(SeqViewer).first();
    expect(firstViewer.find(".la-vz-linear-scroller").length).toBeTruthy();
    expect(firstViewer.find(".la-vz-circular-viewer").length).toBeFalsy();
  });

  it("renders with Genbank file string input", async () => {
    const file = path.join(__dirname, "io", "examples", "genbank", "pBbE0c-RFP_1.gb");
    const fileContents = fs.readFileSync(file, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: "pBbE0c-RFP_1.gb"
    }); // expected part
    const part = parts[0];

    const wrapper = mount(<SeqViz {...defaultProps} file={fileContents} />);
    await wrapper.instance().componentDidMount();

    // check that the part state matches the state of the Genbank file
    expect(wrapper.state().part.seq).toEqual(part.seq);
  });

  it("renders with Genbank File/Blob input", async () => {
    const fileName = path.join(__dirname, "io", "examples", "genbank", "pBbE0c-RFP_1.gb");
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    await wrapper.instance().componentDidMount();

    // check that the part state matches the state of the Genbank file
    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with FASTA File/Blob input", async () => {
    const fileName = path.join(__dirname, "io", "examples", "fasta", "R0010_AB.gb");
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    await wrapper.instance().componentDidMount();

    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with SBOL File/Blob input", async () => {
    const fileName = path.join(__dirname, "io", "examples", "sbol", "v2", "A1.xml");
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    await wrapper.instance().componentDidMount();

    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with SnapGene File/Blob input", async () => {
    const fileName = path.join(__dirname, "io", "examples", "snapgene", "pBbB8c-GFP.dna");
    const fileContents = fs.readFileSync(fileName);
    const file = new File([fileContents], fileName);
    const parts = await filesToParts([file], { fileName });
    const part = parts[0];

    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    await wrapper.instance().componentDidMount();

    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  // it("re-renders the viewer with a changed File object", async () => {
  //   const fileName1 = path.join(
  //     __dirname,
  //     "io",
  //     "examples",
  //     "snapgene",
  //     "pBbB8c-GFP.dna"
  //   );
  //   const fileName2 = path.join(
  //     __dirname,
  //     "io",
  //     "examples",
  //     "genbank",
  //     "NC_011521.gb"
  //   );
  //   const fileContents1 = fs.readFileSync(fileName1);
  //   const file1 = new File([fileContents1], fileName1);
  //   const fileContents2 = fs.readFileSync(fileName2);
  //   const file2 = new File([fileContents2], fileName2);

  //   const parts1 = await filesToParts([file1], { fileName: fileName1 });
  //   const part1 = parts1[0];
  //   const parts2 = await filesToParts([file2], { fileName: fileName2 });
  //   const part2 = parts2[0];

  //   const wrapper = mount(<SeqViz {...defaultProps} file={file1} />);
  //   await wrapper.instance().componentDidMount();

  //   expect(wrapper.state().part).toMatchObject({
  //     seq: part1.seq,
  //     compSeq: part1.compSeq
  //   });

  //   // change the file prop
  //   await wrapper.setProps({ file: file2 });
  //   expect(wrapper.state().part).toMatchObject({
  //     seq: part2.seq,
  //     compSeq: part2.compSeq
  //   });
  // });
});
