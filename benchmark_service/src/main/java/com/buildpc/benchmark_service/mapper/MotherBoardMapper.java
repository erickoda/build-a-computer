package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.MotherBoard;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class MotherBoardMapper {

    public MotherBoardResponse toProto(MotherBoard motherBoard) {
        MotherBoardResponse.Builder builder = MotherBoardResponse.newBuilder()
                .setId(String.valueOf(motherBoard.getId()))
                .setBrand(motherBoard.getBrand())
                .setSeries(motherBoard.getSeries())
                .setSocket(motherBoard.getSocket())
                .setDdr(motherBoard.getDdr())
                .setMemorySlots(motherBoard.getMemorySlots())
                .setMaxRam(motherBoard.getMaxRAM())
                .setMaxRamFrequencyMhz(motherBoard.getMaxRamMemoryFrequencyMhz())
                .setM2Slots(motherBoard.getM2Slots())
                .setPciExpressX16(motherBoard.getPciExpress())
                .setVrm(motherBoard.getVrm())
                .setAvgPrice(motherBoard.getAvgPrice())
                .setScore(motherBoard.getScore())
                .setCreatedAt(dateToTimestamp(motherBoard.getCreatedAt()));

        if (motherBoard.getImg() != null) {
            builder.setImg(ByteString.copyFrom(motherBoard.getImg()));
        }
        if (motherBoard.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(motherBoard.getUpdatedAt()));
        }

        return builder.build();
    }

    public ListMotherBoardResponse createListMotherBoardResponse(List<MotherBoardResponse> mbResponses) {
        return ListMotherBoardResponse.newBuilder()
                .addAllMotherboard(mbResponses)
                .build();
    }

    public DeleteMotherBoardResponse createDeleteMotherBoardResponse(boolean deletedSuccess) {
        return DeleteMotherBoardResponse.newBuilder()
                .setSuccess(deletedSuccess)
                .build();
    }

    public MotherBoard toEntity(CreateMotherBoardRequest request) {
        MotherBoard motherBoard = new MotherBoard();
        motherBoard.setBrand(request.getBrand());
        motherBoard.setSeries(request.getSeries());
        motherBoard.setSocket(request.getSocket());
        motherBoard.setDdr(request.getDdr());
        motherBoard.setMemorySlots(request.getMemorySlots());
        motherBoard.setMaxRAM(request.getMaxRam());
        motherBoard.setMaxRamMemoryFrequencyMhz(request.getMaxRamFrequencyMhz());
        motherBoard.setM2Slots(request.getM2Slots());
        motherBoard.setPciExpress(request.getPciExpressX16());
        motherBoard.setVrm(request.getVrm());
        motherBoard.setAvgPrice(request.getAvgPrice());
        motherBoard.setScore(request.getScore());

        if (request.hasImg()) {
            motherBoard.setImg(request.getImg().toByteArray());
        }

        return motherBoard;
    }

    public MotherBoard toEntity(UpdateMotherBoardRequest request) {
        MotherBoard motherBoard = new MotherBoard();
        motherBoard.setBrand(request.getBrand());
        motherBoard.setSeries(request.getSeries());
        motherBoard.setSocket(request.getSocket());
        motherBoard.setDdr(request.getDdr());
        motherBoard.setMemorySlots(request.getMemorySlots());
        motherBoard.setMaxRAM(request.getMaxRam());
        motherBoard.setMaxRamMemoryFrequencyMhz(request.getMaxRamFrequencyMhz());
        motherBoard.setM2Slots(request.getM2Slots());
        motherBoard.setPciExpress(request.getPciExpressX16());
        motherBoard.setVrm(request.getVrm());
        motherBoard.setAvgPrice(request.getAvgPrice());
        motherBoard.setScore(request.getScore());

        if (request.hasImg()) {
            motherBoard.setImg(request.getImg().toByteArray());
        }

        return motherBoard;
    }

    private Timestamp dateToTimestamp(LocalDateTime dateTime) {
        Instant instant = dateTime.atZone(ZoneId.systemDefault()).toInstant();

        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}