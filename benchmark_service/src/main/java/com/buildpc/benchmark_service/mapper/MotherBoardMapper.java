package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.MotherBoard;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.sql.Date;
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
                .setMaxRamFrequencyMhz(motherBoard.getMaxRamFrequency())
                .setM2Slots(motherBoard.getMaxM2Slots())
                .setPciExpressX16(motherBoard.getPciExpress())
                .setVrm(motherBoard.getVrms())
                .setAvgPrice(motherBoard.getAveragePrice())
                .setScore(motherBoard.getScore())
                .setCreatedAt(dateToTimestamp(motherBoard.getCreatedAt()));

        if (motherBoard.getImage() != null) {
            builder.setImg(ByteString.copyFrom(motherBoard.getImage()));
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
        motherBoard.setMaxRamFrequency(request.getMaxRamFrequencyMhz());
        motherBoard.setMaxM2Slots(request.getM2Slots());
        motherBoard.setPciExpress(request.getPciExpressX16());
        motherBoard.setVrms(request.getVrm());
        motherBoard.setAveragePrice(request.getAvgPrice());
        motherBoard.setScore(request.getScore());

        if (request.hasImg()) {
            motherBoard.setImage(request.getImg().toByteArray());
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