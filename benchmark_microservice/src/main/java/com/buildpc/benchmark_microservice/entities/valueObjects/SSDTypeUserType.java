package com.buildpc.benchmark_microservice.entities.valueObjects;

import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.usertype.UserType;
import org.postgresql.util.PGobject;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

public class SSDTypeUserType implements UserType<SSDType> {

    @Override
    public int getSqlType() {
        return Types.OTHER;
    }

    @Override
    public Class<SSDType> returnedClass() {
        return SSDType.class;
    }

    @Override
    public SSDType nullSafeGet(ResultSet rs, int position,
                               WrapperOptions options) throws SQLException {
        Object value = rs.getObject(position);
        if (rs.wasNull() || value == null) return null;
        return SSDType.fromDatabaseValue(value.toString());
    }

    @Override
    public void nullSafeSet(PreparedStatement st, SSDType value, int index,
                            WrapperOptions options) throws SQLException {
        if (value == null) {
            st.setNull(index, Types.OTHER);
        } else {
            PGobject pgObject = new PGobject();
            pgObject.setType("ssd_type");
            pgObject.setValue(value.toDatabaseValue());
            st.setObject(index, pgObject);
        }
    }

    @Override
    public boolean equals(SSDType x, SSDType y) { return x == y; }

    @Override
    public int hashCode(SSDType x) { return x != null ? x.hashCode() : 0; }

    @Override
    public SSDType deepCopy(SSDType value) { return value; }

    @Override
    public boolean isMutable() { return false; }

    @Override
    public Serializable disassemble(SSDType value) { return value; }

    @Override
    public SSDType assemble(Serializable cached, Object owner) { return (SSDType) cached; }
}
